# Learnamuse website (لرناموز)

This is the Persian, right-to-left website for Learnamuse. It is a redesign of the WordPress site at https://learnamuse.com and is built as a **Next.js 16 static export** hosted on **GitHub Pages**. The contact form posts to a small **Cloudflare Worker** (in `worker/`), which forwards each message to Telegram.

For the team contract (hard constraints and file ownership), see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Stack

- **Next.js 16.4** (App Router) with `output: "export"` and `trailingSlash: true`. No Node server runs in production.
- **React 19, Tailwind CSS 4, Vazirmatn**.
- **zod** validates the content in `content/*.json` at build time.
- **sharp** pre-generates WebP image variants. `next/image` uses a custom loader to pick them up.
- **Cloudflare Worker** handles the contact form: Telegram Bot API delivery, optional Turnstile, per-IP rate limiting.
- **GitHub Actions** builds the site and deploys it to Pages.

## Local development

```bash
npm ci
npm run dev        # http://localhost:3000 (runs the image pipeline first)
npm run validate   # check content/*.json
npm run lint && npm run typecheck
npm run build      # static site in out/ (runs the image pipeline first)
npx serve out      # preview the export
```

Node 22 or newer is required.

## Scripts

| Script | What it does |
|---|---|
| `npm run images` | Converts every jpg/png/webp under `public/images/` to `public/_img/<path>@<w>.webp` at widths 64, 128, 256, 384, 768, 1280 and 1920. Images are never upscaled. Runs are incremental through a content-hash manifest, and variants of deleted sources are pruned. Also runs automatically as `prebuild` and `predev`. |
| `npm run images:unused` | Lists images in `public/images/` that nothing in `content/` or `src/` references. It only reports and never deletes. |
| `npm run validate` | Validates content against the zod schemas in `src/lib/schemas.ts`. It also checks that:<ul><li>every `/images/...` path exists, with exact letter case (GitHub Pages is case-sensitive)</li><li>slugs are unique</li><li>nav routes exist</li><li>no route listed in `scripts/published-routes.json` has disappeared</li></ul>Exits 1 on any error. CI runs it before every build. |
| `npm run cert:add` | Adds a graduate certificate. See below. |
| `npm run worker:test` | Runs the Worker's test suite. |

## Editing content

All copy lives in `content/`:

- `site.json`: name, logos, nav, footer, contact channels
- `pages.json`: home, about and contact text
- `certificates.json`: courses and certificates

Images go in `public/images/` (the paths mirror the old `wp-content/uploads/`). Reference them as `/images/...`. After an edit, run `npm run validate`.

### Adding a certificate

```bash
npm run cert:add -- --course aitoolbox --name-fa "سارا رحیمی" --name-en "Sara Rahimi" \
  --salutation "سرکار خانم" --photo ~/Downloads/sara.jpg
# optional: --issued 2025-03-08 --issued-fa "18 اسفند 1403"  (defaults to the course date)
#           --slug custom-slug   --dry-run   --root <other checkout>
```

The command:

1. Builds the slug from the English name in kebab case (`sara-rahimi`) and refuses duplicates.
2. Copies the photo to `public/images/certificates/<course>/<slug>.<ext>`.
3. Inserts the entry in sorted order.
4. Re-validates everything. If validation fails, all changes are rolled back.
5. Records the new route in `scripts/published-routes.json`.

The course duration comes from the course. Commit the changes and push to `main`, and the page goes live at `/certificates/<course>/<slug>/`.

> Certificate URLs are printed and shared, so never rename or remove a slug. `validate` fails if a published route disappears. If a removal really is intentional, edit `scripts/published-routes.json` by hand.

### Static data endpoints

- `/data/certificates.json` is a public verification index: `{ generatedAt, courses[], certificates[{ slug, course, nameFa, nameEn, issuedOn, issuedOnFa, url }] }`, with absolute URLs. In browser code, fetch it with `asset("/data/certificates.json")`.
- `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest` are generated from the content.

All of these are `force-static` route handlers. In the export, a handler whose folder name has an extension (`data/certificates.json/route.ts`) is written as that plain file, and `trailingSlash` does not affect it.

## Contact form

The UI only talks to `src/lib/contact-client.ts`. Validation rules live in `worker/src/validation.ts` and are shared by the client and the Worker. Without `NEXT_PUBLIC_CONTACT_ENDPOINT`, the form tells visitors to use Telegram or email instead. To deploy the Worker, set its secrets, and connect it to the site, see [`worker/README.md`](worker/README.md).

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main` and on manual dispatch. The steps:

1. `npm ci`
2. `npm run validate`
3. `actions/configure-pages`, which provides the base path and origin
4. Restore the `public/_img` cache
5. `npm run build`
6. Add `out/.nojekyll`
7. Upload the Pages artifact and deploy it

`ci.yml` runs on pull requests: validate, typecheck, lint, and the Worker tests and bundle. `worker-deploy.yml` deploys the Worker when `worker/**` changes, and is skipped until a `CLOUDFLARE_API_TOKEN` secret exists.

One-time setup:

1. Push to `git@github.com:learnamuse/learnamuse-website.git`.
2. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Optionally, add these under **Settings → Secrets and variables → Actions → Variables**: `NEXT_PUBLIC_CONTACT_ENDPOINT` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

Until a custom domain is set, the site is served at `https://learnamuse.github.io/learnamuse-website/`. All links work under that sub-path because the workflow sets `NEXT_PUBLIC_BASE_PATH`. `robots.txt` only takes effect at a host root, which means after the domain switch.

### Switching learnamuse.com to GitHub Pages

learnamuse.com is still served by WordPress, and switching it over is the owner's call. When you are ready:

1. Add a `public/CNAME` file containing `learnamuse.com`. Also set **Settings → Pages → Custom domain** to `learnamuse.com`, and verify the domain under the organization's Pages settings.
2. DNS records:
   - Apex `learnamuse.com`: `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. Optionally, add `AAAA` records to `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`.
   - `www`: `CNAME` to `learnamuse.github.io`.
3. Wait for the certificate, then enable **Enforce HTTPS**. Re-run the deploy workflow. `configure-pages` now reports an empty base path and the `https://learnamuse.com` origin, so URLs, the sitemap and canonical links update on their own.

All live URLs (`/about-us/`, `/contact-us/`, `/certificates/aitoolbox/<slug>/`) are kept as-is, so no redirects are needed. GitHub Pages can't do server redirects anyway. Unknown paths get the exported `404.html`. Old WordPress asset URLs such as `/wp-content/uploads/...` are **not** mapped. If external links to them matter, copy those files to the same paths under `public/`.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | Set by the deploy workflow from `configure-pages` | `""` on a custom domain, `/learnamuse-website` on github.io |
| `NEXT_PUBLIC_SITE_URL` | Set by the deploy workflow (origin only) | Canonical origin for the sitemap, metadata and share links. `src/lib/url.ts` appends the base path. Defaults to `https://learnamuse.com`. |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Repo variable | Worker URL including `/contact`. The form is disabled when this is empty. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Repo variable, optional | Turnstile site key. Requires `TURNSTILE_SECRET` on the Worker. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET` | Worker secrets (`wrangler secret put`) | Message delivery and spam protection |
| `CLOUDFLARE_API_TOKEN` (secret), `CLOUDFLARE_ACCOUNT_ID` (variable) | GitHub, optional | Worker deploys from Actions |
