/**
 * Validate /content/*.json before building.
 *
 *   npm run validate                    # check; exit 1 on any error
 *   npm run validate -- --update-routes # also record current routes in scripts/published-routes.json
 *   npm run validate -- --root <dir>    # validate another checkout / temp copy
 *
 * Checks: zod schemas (shared with src/lib/content.ts), referenced /images/... files exist
 * (case-sensitive), unique slugs, nav routes exist, and no previously published route vanished.
 */
import path from "node:path";
import { parseArgs } from "node:util";
import { checkContent, writeRoutesLock } from "./lib/content-check";

const { values } = parseArgs({
  options: {
    root: { type: "string" },
    "update-routes": { type: "boolean", default: false },
    quiet: { type: "boolean", default: false },
  },
});

const root = path.resolve(values.root ?? path.join(__dirname, ".."));
const result = checkContent(root);

if (values["update-routes"] && result.errors.length === 0) {
  writeRoutesLock(root, result.routes);
  result.warnings = result.warnings.filter((w) => !w.includes("published-routes.json"));
  console.log(`[validate] recorded ${result.routes.length} routes in scripts/published-routes.json`);
}

for (const w of result.warnings) console.warn(`  warn  ${w}`);
for (const e of result.errors) console.error(`  error ${e}`);

if (result.errors.length) {
  console.error(`\n[validate] ${result.errors.length} error(s) in content — fix them before building.`);
  process.exit(1);
}
if (!values.quiet) console.log(`[validate] content OK — ${result.routes.length} routes, ${result.warnings.length} warning(s).`);
