/**
 * Content validation shared by scripts/validate-content.ts and scripts/add-certificate.ts.
 * Pure Node (no Next.js, no "server-only"): uses the same zod schemas as src/lib/content.ts.
 */
import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import {
  CertificatesFileSchema,
  PagesSchema,
  SiteSchema,
  certificateRoute,
  courseRoute,
} from "../../src/lib/schemas";

export type CertificatesFile = z.infer<typeof CertificatesFileSchema>;

export type CheckResult = {
  errors: string[];
  warnings: string[];
  /** Every route the content produces (sorted). */
  routes: string[];
};

export const STATIC_ROUTES = ["/", "/about-us/", "/contact-us/", "/certificates/"];
export const ROUTES_LOCK = "scripts/published-routes.json";
const IMAGE_LITERAL = /["'`](\/images\/[^"'`\s$]+?\.(?:png|jpe?g|webp|svg|gif))["'`]/gi;

/** Case-sensitive existence check (macOS is case-insensitive; GitHub Pages is not). */
export function existsExact(root: string, relPosix: string): boolean {
  let dir = root;
  for (const part of relPosix.split("/").filter(Boolean)) {
    let names: string[];
    try {
      names = fs.readdirSync(dir);
    } catch {
      return false;
    }
    if (!names.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

function readJson(root: string, rel: string, errors: string[]): unknown {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  } catch (err) {
    errors.push(`${rel}: cannot read/parse JSON (${err instanceof Error ? err.message : String(err)})`);
    return undefined;
  }
}

function zodCheck(schema: z.ZodTypeAny, data: unknown, file: string, errors: string[]) {
  const r = schema.safeParse(data);
  if (!r.success) for (const i of r.error.issues) errors.push(`${file}: ${i.path.join(".") || "(root)"}: ${i.message}`);
  return r.success;
}

/** Collect every "/images/..." string anywhere in a JSON value, with its JSON path. */
function collectImagePaths(value: unknown, at: string, out: Array<{ at: string; src: string }>) {
  if (typeof value === "string") {
    if (value.startsWith("/images/")) out.push({ at, src: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectImagePaths(v, `${at}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectImagePaths(v, at ? `${at}.${k}` : k, out);
  }
}

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

export function certificateSortKey(file: CertificatesFile) {
  const order = new Map(file.courses.map((c, i) => [c.slug, i]));
  return (a: { course: string; slug: string }, b: { course: string; slug: string }) =>
    (order.get(a.course) ?? 1e9) - (order.get(b.course) ?? 1e9) || a.slug.localeCompare(b.slug);
}

export function routesFor(file: CertificatesFile): string[] {
  return [
    ...STATIC_ROUTES,
    ...file.courses.map((c) => courseRoute(c.slug)),
    ...file.certificates.map((c) => certificateRoute(c.course, c.slug)),
  ].sort();
}

export function readRoutesLock(root: string): string[] | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, ROUTES_LOCK), "utf8")).routes as string[];
  } catch {
    return null;
  }
}

export function writeRoutesLock(root: string, routes: string[]) {
  const prev = readRoutesLock(root) ?? [];
  const merged = [...new Set([...prev, ...routes])].sort();
  const body = {
    $comment:
      "Routes that have been published and must keep working (printed/shared certificate links). " +
      "validate-content fails if any of these disappear. Updated by cert:add and `npm run validate -- --update-routes`.",
    routes: merged,
  };
  fs.writeFileSync(path.join(root, ROUTES_LOCK), JSON.stringify(body, null, 2) + "\n");
}

export function checkContent(root: string): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const publicDir = path.join(root, "public");

  const site = readJson(root, "content/site.json", errors);
  const pages = readJson(root, "content/pages.json", errors);
  const certs = readJson(root, "content/certificates.json", errors);

  if (site !== undefined) zodCheck(SiteSchema, site, "content/site.json", errors);
  if (pages !== undefined) zodCheck(PagesSchema, pages, "content/pages.json", errors);
  const certsOk = certs !== undefined && zodCheck(CertificatesFileSchema, certs, "content/certificates.json", errors);

  // Every referenced image must exist on disk with exact casing.
  const refs: Array<{ at: string; src: string; file: string }> = [];
  for (const [file, data] of [
    ["content/site.json", site],
    ["content/pages.json", pages],
    ["content/certificates.json", certs],
  ] as const) {
    const found: Array<{ at: string; src: string }> = [];
    collectImagePaths(data, "", found);
    refs.push(...found.map((f) => ({ ...f, file })));
  }
  for (const r of refs) {
    if (!existsExact(publicDir, r.src)) errors.push(`${r.file}: ${r.at}: image not found (case-sensitive): public${r.src}`);
  }

  // Hard-coded /images/... literals in src/ must exist too.
  for (const f of walk(path.join(root, "src")).filter((p) => /\.(tsx?|jsx?|css)$/.test(p))) {
    // Ignore comments (examples in JSDoc are not real references).
    const text = fs
      .readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "$1");
    for (const m of text.matchAll(IMAGE_LITERAL)) {
      if (!existsExact(publicDir, m[1])) errors.push(`${path.relative(root, f)}: image not found (case-sensitive): public${m[1]}`);
    }
  }

  let routes: string[] = [];
  if (certsOk) {
    const file = certs as CertificatesFile;

    // Unique slugs (course slugs; certificate slugs per course are checked by the schema).
    const dupCourses = file.courses.map((c) => c.slug).filter((s, i, a) => a.indexOf(s) !== i);
    for (const d of new Set(dupCourses)) errors.push(`content/certificates.json: duplicate course slug "${d}"`);

    // Same person twice in a course is almost always a mistake.
    const seenNames = new Map<string, string>();
    for (const c of file.certificates) {
      const key = `${c.course}/${c.nameEn.trim().toLowerCase()}`;
      if (seenNames.has(key)) warnings.push(`certificates: "${c.nameEn}" appears twice in ${c.course} (${seenNames.get(key)}, ${c.slug})`);
      seenNames.set(key, c.slug);
    }

    const sorted = [...file.certificates].sort(certificateSortKey(file));
    if (sorted.some((c, i) => c !== file.certificates[i]))
      warnings.push("content/certificates.json: certificates are not sorted by course, slug (cert:add keeps them sorted)");

    routes = routesFor(file);

    // Routes stable: everything ever published must still be produced.
    const lock = readRoutesLock(root);
    if (!lock) {
      warnings.push(`${ROUTES_LOCK} missing — run \`npm run validate -- --update-routes\` to record published routes`);
    } else {
      const have = new Set(routes);
      for (const r of lock) if (!have.has(r)) errors.push(`published route disappeared: ${r} (listed in ${ROUTES_LOCK})`);
      const locked = new Set(lock);
      const fresh = routes.filter((r) => !locked.has(r));
      if (fresh.length)
        warnings.push(`${fresh.length} new route(s) not yet in ${ROUTES_LOCK}: ${fresh.join(", ")} (run with --update-routes)`);
    }
  }

  // Nav must point at real routes.
  if (site && routes.length) {
    const have = new Set(routes);
    for (const n of (site as { nav?: Array<{ route: string }> }).nav ?? [])
      if (!have.has(n.route)) errors.push(`content/site.json: nav route "${n.route}" is not a known route`);
  }

  return { errors, warnings, routes };
}
