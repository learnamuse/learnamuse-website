/**
 * Typed, validated content layer. All site content lives in /content/*.json and is
 * validated with zod at build time — a malformed certificate fails the build instead
 * of shipping a broken page.
 *
 * Server-only: import from Server Components / generateStaticParams / generateMetadata.
 */
import "server-only";
import { z } from "zod";
import siteJson from "../../content/site.json";
import pagesJson from "../../content/pages.json";
import certificatesJson from "../../content/certificates.json";
import botJson from "../../content/bot.json";
import {
  BotPageSchema,
  CertificatesFileSchema,
  certificateRoute,
  courseRoute,
  PagesSchema,
  SiteSchema,
  type BotPage,
  type Certificate,
  type Course,
  type Pages,
  type Site,
} from "./schemas";

export { SiteSchema, PagesSchema, CourseSchema, CertificateSchema } from "./schemas";
export type { Site, Pages, Course, Certificate, BotPage } from "./schemas";
export type CertificateWithCourse = Certificate & { courseData: Course; route: string };

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new Error(`Invalid content in ${file}:\n${r.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  return r.data;
}

export const site: Site = parse(SiteSchema, siteJson, "content/site.json");
export const pages: Pages = parse(PagesSchema, pagesJson, "content/pages.json");
/** Copy for /bale-bot/ (content/bot.json). */
export const bot: BotPage = parse(BotPageSchema, botJson, "content/bot.json");
const certFile = parse(CertificatesFileSchema, certificatesJson, "content/certificates.json");

export { certificateRoute, courseRoute };

export function getCourses(): Course[] {
  return certFile.courses;
}

export function getCourse(slug: string): Course | undefined {
  return certFile.courses.find((c) => c.slug === slug);
}

export function getCertificates(course?: string): CertificateWithCourse[] {
  return certFile.certificates
    .filter((c) => !course || c.course === course)
    .map((c) => ({ ...c, courseData: getCourse(c.course)!, route: certificateRoute(c.course, c.slug) }));
}

export function getCertificate(course: string, slug: string): CertificateWithCourse | undefined {
  return getCertificates(course).find((c) => c.slug === slug);
}
