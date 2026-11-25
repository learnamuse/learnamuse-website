"use client";

/**
 * Custom next/image loader for the static export.
 *
 * scripts/optimize-images.mjs pre-generates WebP variants at build time:
 *   public/images/2025/03/Sara_Rahimi_1.jpg  ->  public/_img/2025/03/Sara_Rahimi_1.jpg@768.webp
 *
 * Only paths under /images/ with a raster extension are optimized; anything else
 * (SVG, remote URLs) is returned unchanged.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const WIDTHS = [64, 128, 256, 384, 768, 1280, 1920];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/images/") || !/\.(jpe?g|png|webp)$/i.test(src)) {
    return src.startsWith("/") ? `${BASE_PATH}${src}` : src;
  }
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `${BASE_PATH}/_img/${src.slice("/images/".length)}@${w}.webp`;
}
