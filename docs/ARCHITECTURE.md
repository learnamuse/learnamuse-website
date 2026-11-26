# Learnamuse website: architecture and team contract

This is a redesign of https://learnamuse.com, which was WordPress with Elementor. The site is in Persian, right to left (`lang="fa" dir="rtl"`).
It is deployed to **GitHub Pages** as a Next.js 16 **static export**, so no Node server runs in production.

> Next.js 16.4 has breaking changes compared with older versions. Read `node_modules/next/dist/docs/` before using an API you're unsure of (see AGENTS.md).

## Hard constraints
- `output: "export"` and `trailingSlash: true`. Every route is emitted as `route/index.html`.
- **These routes must keep their exact URLs.** They are live and shared, and certificate links are printed or sent to people.
  - `/`, `/about-us/`, `/contact-us/`
  - `/certificates/`, `/certificates/aitoolbox/`
  - `/certificates/aitoolbox/<slug>/`, for the 21 slugs in `content/certificates.json`
- Static export cannot use: server actions, `cookies()`, `headers()`, request-dependent route handlers, rewrites, redirects, or proxy. Dynamic routes need `generateStaticParams()` and `export const dynamicParams = false`.
- Base path: the site may be served from `/learnamuse-website` (github.io) or from `/` (custom domain).
  - `next/link` and `next/image` handle the base path automatically.
  - Raw `<img src>`, CSS `url()`, and `fetch()` of static files **must** use `asset()` from `src/lib/url.ts`.
- Images: use `next/image` with root-relative `/images/...` paths. The custom loader (`src/lib/image-loader.ts`) maps them to build-time WebP variants in `public/_img/`, which `scripts/optimize-images.mjs` generates.

## Content (single source of truth)
- `content/site.json`: name, tagline, logos, nav, footer, contact channels.
- `content/pages.json`: copy for home, about, and contact (plus the contact form field definitions).
- `content/certificates.json`: courses and certificates.
- `src/lib/content.ts`: zod-validated loaders. Use `site`, `pages`, `getCourses()`, `getCourse()`, `getCertificates()`, and `getCertificate()`. These are server-only, so client components receive data as props.
- `public/images/**`: all images from the old site. Paths mirror the old `wp-content/uploads/` folder.

## Design tokens
Defined in `src/app/globals.css` and exposed as Tailwind colors: `brand`, `brand-strong`, `brand-soft`, `brand-ink`, `gold`, `gold-soft`, `bg`, `surface`, `surface-2`, `ink`, `ink-2`, `ink-3`, `line`. Also `rounded-card` and `shadow-card`. The site is light-only (no dark mode). The font is Vazirmatn (`next/font`).

## File ownership (agents must not edit each other's files)
| Area | Owner |
|---|---|
| `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/app/not-found.tsx`, `src/app/globals.css`, `src/components/**` | Frontend / design |
| `src/app/data/**` (static JSON endpoints), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts` | Backend |
| `scripts/**`, `.github/**`, `public/.nojekyll`, `public/CNAME`, `package.json` scripts | Backend |
| `src/lib/content.ts`, `src/lib/url.ts`, `src/lib/image-loader.ts`, `next.config.ts`, `content/**` | Shared. Change only if necessary, and say so in your report. |

Both agents may add npm dependencies (`npm i <pkg>@<exact-version>`).

## Contact
There is no form or contact backend. Contact pages link to the channels in `content/site.json` → `contact`: Telegram is the channel for website visitors; the Bale bot's support section is only for existing bot members.
