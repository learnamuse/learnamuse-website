import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/url";

export const dynamic = "force-static";

/**
 * /robots.txt. Note: crawlers only read robots.txt at the host root, so when the site is
 * served from a sub-path (learnamuse.github.io/learnamuse-website/) this file is inert —
 * it takes effect once the custom domain points at GitHub Pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // Don't block /_next/ (JS/CSS needed for rendering) or /_img/ (page images) from crawlers.
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
