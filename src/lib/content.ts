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

const imagePath = z.string().regex(/^\/images\/.+\.(png|jpe?g|webp|svg)$/i, "must be a /images/... path");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-kebab-case slug");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const SiteSchema = z.object({
  name: z.string(),
  nameEn: z.string(),
  tagline: z.string(),
  url: z.string().url(),
  lang: z.string(),
  dir: z.enum(["rtl", "ltr"]),
  logo: z.object({ full: imagePath, mark: imagePath, markWhite: imagePath }),
  nav: z.array(z.object({ label: z.string(), route: z.string().startsWith("/") })),
  footer: z.object({ cta: z.string(), copyright: z.string() }),
  contact: z.object({ telegram: z.string().url(), telegramHandle: z.string(), email: z.string().email() }),
  social: z.array(z.object({ label: z.string(), href: z.string().url() })),
});

const Feature = z.object({ title: z.string(), body: z.string(), image: imagePath.nullable() });

export const PagesSchema = z.object({
  home: z.object({
    hero: z.object({ title: z.string(), lead: z.string(), image: imagePath }),
    features: z.array(Feature),
  }),
  about: z.object({
    title: z.string(),
    intro: z.string(),
    values: z.array(z.object({ title: z.string(), body: z.string() })),
    closing: z.string(),
  }),
  contact: z.object({
    title: z.string(),
    form: z.object({
      fields: z.array(
        z.object({
          key: z.enum(["name", "phone", "message", "wantsCollaboration"]),
          type: z.string(),
          label: z.string(),
          placeholder: z.string(),
          required: z.boolean(),
        }),
      ),
      submitLabel: z.string(),
    }),
  }),
});

export const CourseSchema = z.object({
  slug,
  titleEn: z.string(),
  titleFa: z.string(),
  partner: z.string(),
  partnerLabel: z.string(),
  durationHours: z.number().positive(),
  durationFa: z.string(),
  heldOn: isoDate,
  heldOnFa: z.string(),
  badge: imagePath,
  tools: z.array(z.object({ name: z.string(), logo: imagePath })),
});

export const CertificateSchema = z.object({
  slug,
  course: slug,
  nameFa: z.string().min(2),
  nameEn: z.string().min(2),
  salutation: z.string().nullable(),
  issuedOn: isoDate,
  issuedOnFa: z.string(),
  photo: imagePath.nullable(),
});

const CertificatesFileSchema = z
  .object({ courses: z.array(CourseSchema), certificates: z.array(CertificateSchema) })
  .superRefine((v, ctx) => {
    const courseSlugs = new Set(v.courses.map((c) => c.slug));
    const seen = new Set<string>();
    v.certificates.forEach((c, i) => {
      if (!courseSlugs.has(c.course))
        ctx.addIssue({ code: "custom", path: ["certificates", i, "course"], message: `unknown course "${c.course}"` });
      const key = `${c.course}/${c.slug}`;
      if (seen.has(key)) ctx.addIssue({ code: "custom", path: ["certificates", i, "slug"], message: `duplicate ${key}` });
      seen.add(key);
    });
  });

export type Site = z.infer<typeof SiteSchema>;
export type Pages = z.infer<typeof PagesSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
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
const certFile = parse(CertificatesFileSchema, certificatesJson, "content/certificates.json");

export const certificateRoute = (course: string, slug: string) => `/certificates/${course}/${slug}/`;
export const courseRoute = (course: string) => `/certificates/${course}/`;

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
