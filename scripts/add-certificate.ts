/**
 * Add a graduate certificate.
 *
 *   npm run cert:add -- --course aitoolbox --name-fa "سارا رحیمی" --name-en "Sara Rahimi" \
 *     [--salutation "سرکار خانم"] [--photo ./sara.jpg] [--issued 2025-03-08 --issued-fa "18 اسفند 1403"] \
 *     [--slug custom-slug] [--dry-run] [--root <repo dir>]
 *
 * - slug: kebab-case of the English name (override with --slug); duplicates are refused.
 * - photo: copied to public/images/certificates/<course>/<slug>.<ext>.
 * - issued date defaults to the course's heldOn / heldOnFa (course duration comes from the course).
 * - certificates stay sorted by course, slug; the content is re-validated and the new route is
 *   recorded in scripts/published-routes.json. On a validation failure every change is rolled back.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { CertificateSchema, certificateRoute } from "../src/lib/schemas";
import { absoluteUrl } from "../src/lib/url";
import { certificateSortKey, checkContent, writeRoutesLock, ROUTES_LOCK, type CertificatesFile } from "./lib/content-check";

const USAGE = `Usage: npm run cert:add -- --course <slug> --name-fa "<نام>" --name-en "<Name>"
       [--salutation "سرکار خانم"|"جناب آقای"] [--photo ./photo.jpg]
       [--issued YYYY-MM-DD --issued-fa "18 اسفند 1403"] [--slug <slug>] [--dry-run] [--root <dir>]`;

function fail(msg: string): never {
  console.error(`[cert:add] ${msg}\n\n${USAGE}`);
  process.exit(1);
}

function slugify(nameEn: string): string {
  return nameEn
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const { values } = parseArgs({
  options: {
    course: { type: "string" },
    "name-fa": { type: "string" },
    "name-en": { type: "string" },
    salutation: { type: "string" },
    photo: { type: "string" },
    issued: { type: "string" },
    "issued-fa": { type: "string" },
    slug: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    root: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});
if (values.help) {
  console.log(USAGE);
  process.exit(0);
}

const root = path.resolve(values.root ?? path.join(__dirname, ".."));
const certsPath = path.join(root, "content", "certificates.json");
const lockPath = path.join(root, ROUTES_LOCK);

const courseSlug = values.course?.trim();
const nameFa = values["name-fa"]?.trim().replace(/\s+/g, " ");
const nameEn = values["name-en"]?.trim().replace(/\s+/g, " ");
if (!courseSlug) fail("--course is required");
if (!nameFa) fail("--name-fa is required");
if (!nameEn) fail("--name-en is required");
if ((values.issued && !values["issued-fa"]) || (!values.issued && values["issued-fa"]))
  fail("--issued and --issued-fa must be given together (or neither, to use the course date)");

const originalJson = fs.readFileSync(certsPath, "utf8");
const file = JSON.parse(originalJson) as CertificatesFile;
const course = file.courses.find((c) => c.slug === courseSlug);
if (!course) fail(`unknown course "${courseSlug}". Known: ${file.courses.map((c) => c.slug).join(", ")}`);

const slug = values.slug?.trim() || slugify(nameEn);
if (!slug) fail(`could not derive a slug from "${nameEn}"; pass --slug`);
if (file.certificates.some((c) => c.course === course.slug && c.slug === slug))
  fail(`a certificate "${course.slug}/${slug}" already exists — refusing to overwrite (use --slug for a namesake)`);
if (file.certificates.some((c) => c.course === course.slug && c.nameEn.toLowerCase() === nameEn.toLowerCase()))
  console.warn(`[cert:add] warning: "${nameEn}" already has a certificate in ${course.slug}`);

let photoRel: string | null = null;
let photoSrc: string | null = null;
let photoDest: string | null = null;
if (values.photo) {
  // `npm run` changes cwd to the repo root; resolve relative paths against where the user ran it.
  photoSrc = path.resolve(process.env.INIT_CWD ?? process.cwd(), values.photo);
  if (!fs.existsSync(photoSrc) || !fs.statSync(photoSrc).isFile()) fail(`photo not found: ${values.photo}`);
  let ext = path.extname(photoSrc).toLowerCase();
  if (ext === ".jpeg") ext = ".jpg";
  if (![".jpg", ".png", ".webp"].includes(ext)) fail(`photo must be .jpg, .jpeg, .png or .webp (got ${ext || "no extension"})`);
  photoRel = `/images/certificates/${course.slug}/${slug}${ext}`;
  photoDest = path.join(root, "public", photoRel);
  if (fs.existsSync(photoDest)) fail(`photo destination already exists: public${photoRel}`);
}

const cert = CertificateSchema.parse({
  slug,
  course: course.slug,
  nameFa,
  nameEn,
  salutation: values.salutation?.trim() || null,
  issuedOn: values.issued ?? course.heldOn,
  issuedOnFa: values["issued-fa"]?.trim() ?? course.heldOnFa,
  photo: photoRel,
});

file.certificates.push(cert);
file.certificates.sort(certificateSortKey(file));
const route = certificateRoute(cert.course, cert.slug);

if (values["dry-run"]) {
  console.log("[cert:add] dry run — nothing written. Would add:\n" + JSON.stringify(cert, null, 2));
  if (photoSrc) console.log(`[cert:add] would copy ${photoSrc} -> public${photoRel}`);
  console.log(`[cert:add] route: ${route}`);
  process.exit(0);
}

const originalLock = fs.existsSync(lockPath) ? fs.readFileSync(lockPath, "utf8") : null;
const rollback = () => {
  fs.writeFileSync(certsPath, originalJson);
  if (originalLock === null) fs.rmSync(lockPath, { force: true });
  else fs.writeFileSync(lockPath, originalLock);
  if (photoDest) fs.rmSync(photoDest, { force: true });
};

try {
  if (photoSrc && photoDest) {
    fs.mkdirSync(path.dirname(photoDest), { recursive: true });
    fs.copyFileSync(photoSrc, photoDest, fs.constants.COPYFILE_EXCL);
  }
  fs.writeFileSync(certsPath, JSON.stringify(file, null, 2) + "\n");

  const result = checkContent(root);
  if (result.errors.length) {
    rollback();
    console.error("[cert:add] validation failed — all changes rolled back:\n  " + result.errors.join("\n  "));
    process.exit(1);
  }
  writeRoutesLock(root, result.routes);
} catch (err) {
  rollback();
  throw err;
}

console.log(`[cert:add] added ${cert.nameEn} (${cert.nameFa}) to ${course.slug}`);
if (photoRel) console.log(`[cert:add] photo: public${photoRel}`);
console.log(`[cert:add] page: ${route}  ->  ${absoluteUrl(route)}`);
console.log("[cert:add] next: commit content/, public/images/ and scripts/published-routes.json, then push to main to deploy.");
