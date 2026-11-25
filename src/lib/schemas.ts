/**
 * Zod schemas for /content/*.json — pure (no "server-only"), so build scripts
 * (scripts/validate-content.ts, scripts/add-certificate.ts) can share them with
 * src/lib/content.ts.
 */
import { z } from "zod";

export const imagePath = z.string().regex(/^\/images\/.+\.(png|jpe?g|webp|svg)$/i, "must be a /images/... path");
export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-kebab-case slug");
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

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

export const CertificatesFileSchema = z
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

/** Route helpers (pure). These URLs are live and printed on certificates; never change them. */
export const certificateRoute = (course: string, slug: string) => `/certificates/${course}/${slug}/`;
export const courseRoute = (course: string) => `/certificates/${course}/`;
