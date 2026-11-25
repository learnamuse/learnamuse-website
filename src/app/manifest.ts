import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { asset } from "@/lib/url";

export const dynamic = "force-static";

/** /manifest.webmanifest (Next links it from <head> automatically). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} | ${site.tagline}`,
    short_name: site.name,
    description: site.tagline,
    lang: "fa",
    dir: "rtl",
    start_url: asset("/"),
    scope: asset("/"),
    display: "standalone",
    background_color: "#fbfcf8",
    theme_color: "#7FD141",
    icons: [
      { src: asset("/images/2025/01/LOGO-LearnAmuse-Green-256.png"), sizes: "256x256", type: "image/png", purpose: "any" },
    ],
  };
}
