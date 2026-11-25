#!/usr/bin/env node
/**
 * Build-time image pipeline for the static export.
 *
 * For every raster image in public/images (jpg/jpeg/png/webp) emit WebP variants:
 *   public/images/<rel>  ->  public/_img/<rel>@<w>.webp   for w in WIDTHS
 *
 * This URL scheme MUST match src/lib/image-loader.ts (and next.config.ts images sizes).
 * Images are never upscaled: when the original is narrower than w, the file for w is still
 * written (at the original width) so every URL the loader can produce resolves.
 *
 * Incremental: a manifest (public/_img/.manifest.json) stores a content hash per source.
 * A source is skipped when its hash is unchanged and all variants exist. Content hashes
 * (not mtimes) are used so the CI cache of public/_img survives fresh checkouts.
 * Variants whose source no longer exists are pruned.
 *
 * Usage: node scripts/optimize-images.mjs [--force] [--quiet]
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const WIDTHS = [64, 128, 256, 384, 768, 1280, 1920];
const QUALITY = 78;
/** Bump when encoding settings change to invalidate every cached variant. */
const PIPELINE_VERSION = `v1-q${QUALITY}-${WIDTHS.join(",")}`;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(ROOT, "public", "_img");
const MANIFEST = path.join(OUT_DIR, ".manifest.json");
const RASTER = /\.(jpe?g|png|webp)$/i;

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const QUIET = args.has("--quiet");

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

const toPosix = (p) => p.split(path.sep).join("/");
const variantPath = (rel, w) => path.join(OUT_DIR, `${rel}@${w}.webp`);

async function hashFile(file) {
  const buf = await fs.readFile(file);
  return createHash("sha1").update(PIPELINE_VERSION).update(buf).digest("hex");
}

async function processImage(abs, rel) {
  const input = await fs.readFile(abs);
  // failOn "none": tolerate slightly corrupt legacy WordPress uploads instead of aborting the build.
  const base = sharp(input, { failOn: "none" }).rotate(); // apply EXIF orientation
  const meta = await base.metadata();
  const origWidth = meta.autoOrient?.width ?? meta.width ?? WIDTHS[WIDTHS.length - 1];
  await fs.mkdir(path.dirname(variantPath(rel, WIDTHS[0])), { recursive: true });
  let bytes = 0;
  for (const w of WIDTHS) {
    const target = Math.min(w, origWidth);
    const buf = await base
      .clone()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();
    await fs.writeFile(variantPath(rel, w), buf);
    bytes += buf.length;
  }
  return bytes;
}

async function pool(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const t0 = Date.now();
  if (!existsSync(SRC_DIR)) {
    console.log("[images] public/images not found — nothing to do.");
    return;
  }
  let manifest = {};
  if (!FORCE) {
    try {
      manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
    } catch {
      manifest = {};
    }
  }

  const sources = (await walk(SRC_DIR)).filter((f) => RASTER.test(f)).sort();
  const next = {};
  const stats = { total: sources.length, generated: 0, skipped: 0, failed: 0, pruned: 0, bytes: 0 };
  const failures = [];

  const limit = Math.max(1, Math.min(8, (os.availableParallelism?.() ?? os.cpus().length) - 1));
  sharp.concurrency(1); // parallelism comes from the pool, not libvips threads

  await pool(sources, limit, async (abs) => {
    const rel = toPosix(path.relative(SRC_DIR, abs));
    const hash = await hashFile(abs);
    const complete = WIDTHS.every((w) => existsSync(variantPath(rel, w)));
    if (!FORCE && manifest[rel] === hash && complete) {
      next[rel] = hash;
      stats.skipped++;
      return;
    }
    try {
      const written = await processImage(abs, rel); // await first: `x += await y` races in a pool
      stats.bytes += written;
      next[rel] = hash;
      stats.generated++;
      if (!QUIET) console.log(`[images] ${rel}`);
    } catch (err) {
      stats.failed++;
      failures.push(`${rel}: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  // Prune variants whose source image was removed or renamed.
  const expected = new Set(Object.keys(next).flatMap((rel) => WIDTHS.map((w) => variantPath(rel, w))));
  for (const f of await walk(OUT_DIR)) {
    if (f === MANIFEST || !f.endsWith(".webp")) continue;
    const rel = toPosix(path.relative(OUT_DIR, f)).replace(/@\d+\.webp$/, "");
    if (!expected.has(f) && !sources.includes(path.join(SRC_DIR, rel))) {
      await fs.rm(f);
      stats.pruned++;
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const mb = (stats.bytes / 1024 / 1024).toFixed(1);
  console.log(
    `[images] ${stats.total} sources: ${stats.generated} generated (${mb} MB), ${stats.skipped} up to date, ` +
      `${stats.pruned} stale variants pruned, ${stats.failed} failed — ${secs}s (${WIDTHS.length} widths, ${limit} workers)`,
  );
  if (failures.length) {
    console.error("[images] failures:\n  " + failures.join("\n  "));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
