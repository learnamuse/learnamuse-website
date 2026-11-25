#!/usr/bin/env node
/**
 * Report images in public/images that nothing in content/ or src/ references.
 * Report only — never deletes. Exit code is always 0.
 *
 * A file counts as referenced when its "/images/<rel>" path (or its bare file name,
 * to catch paths assembled in code) appears in any text file under content/ or src/.
 *
 * Usage: node scripts/find-unused-images.mjs [--json]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = path.join(ROOT, "public", "images");
const SEARCH_DIRS = ["content", "src"].map((d) => path.join(ROOT, d));
const TEXT = /\.(json|tsx?|jsx?|mjs|css|mdx?)$/i;

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

const corpus = (
  await Promise.all(
    (await Promise.all(SEARCH_DIRS.map(walk)))
      .flat()
      .filter((f) => TEXT.test(f))
      .map((f) => fs.readFile(f, "utf8")),
  )
).join("\n");

const images = (await walk(IMAGES)).map((f) => path.relative(IMAGES, f).split(path.sep).join("/")).sort();
const unused = [];
let bytes = 0;
for (const rel of images) {
  if (corpus.includes(`/images/${rel}`) || corpus.includes(path.posix.basename(rel))) continue;
  const { size } = await fs.stat(path.join(IMAGES, rel));
  bytes += size;
  unused.push({ path: `/images/${rel}`, size });
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ total: images.length, unused }, null, 2));
} else {
  for (const u of unused) console.log(`${(u.size / 1024).toFixed(0).padStart(6)} KB  ${u.path}`);
  console.log(
    `\n${unused.length} of ${images.length} images in public/images are not referenced from content/ or src/ ` +
      `(${(bytes / 1024 / 1024).toFixed(1)} MB). Nothing was deleted.`,
  );
}
