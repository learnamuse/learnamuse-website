import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages.
 *
 * NEXT_PUBLIC_BASE_PATH is set by the deploy workflow from actions/configure-pages:
 *   - ""                     when a custom domain (learnamuse.com) is configured
 *   - "/learnamuse-website"  when served from learnamuse.github.io/learnamuse-website/
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Separate build dirs let several agents/devs build at once (export output goes here too).
  distDir: process.env.NEXT_DIST_DIR || undefined,
  trailingSlash: true, // keep the WordPress-era URLs: /about-us/, /certificates/aitoolbox/<slug>/
  basePath: basePath || undefined,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Must match WIDTHS in scripts/optimize-images.mjs
    deviceSizes: [384, 768, 1280, 1920],
    imageSizes: [64, 128, 256],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
