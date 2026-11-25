import { site } from "./content";

/**
 * Site-wide Open Graph fields. Next.js does not deep-merge `openGraph`: a page that sets its
 * own `openGraph` replaces the layout's entirely, so every page must spread this in.
 */
export const ogBase = {
  siteName: `${site.name} | ${site.nameEn}`,
  locale: "fa_IR",
  type: "website",
} as const;
