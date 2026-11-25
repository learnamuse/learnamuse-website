/**
 * Public certificate verification index, emitted by the static export as the plain file
 * /data/certificates.json. (Route handlers whose folder name has an extension are copied to
 * out/<route> verbatim, so trailingSlash does not turn this into a directory.)
 *
 * Fetch from the browser with asset("/data/certificates.json") so the base path is honored.
 */
import { courseRoute, getCertificates, getCourses } from "@/lib/content";
import { absoluteUrl } from "@/lib/url";

export const dynamic = "force-static";

export function GET() {
  const body = {
    generatedAt: new Date().toISOString(),
    courses: getCourses().map((c) => ({
      slug: c.slug,
      titleFa: c.titleFa,
      titleEn: c.titleEn,
      partner: c.partner,
      durationHours: c.durationHours,
      heldOn: c.heldOn,
      heldOnFa: c.heldOnFa,
      url: absoluteUrl(courseRoute(c.slug)),
    })),
    certificates: getCertificates().map((c) => ({
      slug: c.slug,
      course: c.course,
      nameFa: c.nameFa,
      nameEn: c.nameEn,
      issuedOn: c.issuedOn,
      issuedOnFa: c.issuedOnFa,
      url: absoluteUrl(c.route),
    })),
  };
  return Response.json(body, { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
