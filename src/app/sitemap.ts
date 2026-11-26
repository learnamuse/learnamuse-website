import type { MetadataRoute } from "next";
import { courseRoute, getCertificates, getCourses } from "@/lib/content";
import { absoluteUrl } from "@/lib/url";

export const dynamic = "force-static";

/** /sitemap.xml — every exported route, absolute, with trailing slashes. */
export default function sitemap(): MetadataRoute.Sitemap {
  const certificates = getCertificates();
  const courses = getCourses();
  const latest = (dates: string[]) => dates.sort().at(-1);

  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/bale-bot/"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about-us/"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/contact-us/"), changeFrequency: "yearly", priority: 0.7 },
    {
      url: absoluteUrl("/certificates/"),
      lastModified: latest(certificates.map((c) => c.issuedOn)),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...courses.map((course) => ({
      url: absoluteUrl(courseRoute(course.slug)),
      lastModified: latest(certificates.filter((c) => c.course === course.slug).map((c) => c.issuedOn)) ?? course.heldOn,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...certificates.map((c) => ({
      url: absoluteUrl(c.route),
      lastModified: c.issuedOn,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
