/** Base path the site is served under ("" on a custom domain). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Canonical public origin, used for metadata, sitemap, share links. */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://learnamuse.com").replace(/\/$/, "");

/**
 * Prefix a root-relative static asset path (e.g. "/images/x.jpg") with the base path.
 * Use for <img>, CSS url(), fetch() of /data/*.json. NOT needed for next/link or next/image
 * (next/link adds basePath itself; next/image goes through src/lib/image-loader.ts).
 */
export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}

/** Absolute URL for a route, e.g. absoluteUrl("/certificates/aitoolbox/sara-rahimi/"). */
export function absoluteUrl(route: string): string {
  return `${SITE_ORIGIN}${BASE_PATH}${route}`;
}
