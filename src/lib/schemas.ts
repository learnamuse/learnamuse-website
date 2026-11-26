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
  contact: z.object({
    bale: z.string().url(),
    baleHandle: z.string(),
    telegram: z.string().url(),
    telegramHandle: z.string(),
    /** no-reply sender address — not a contact channel; don't present it as a way to write to us. */
    email: z.string().email(),
  }),
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

/** content/bot.json: copy for the /bale-bot/ page (the Learnamuse bot on Bale). */
const sectionHead = { eyebrow: z.string(), title: z.string() };
export const BotPageSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  botUrl: z.string().url(),
  botHandle: z.string().startsWith("@"),
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    titleAccent: z.string(),
    lead: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string(),
    chips: z.array(z.string()),
  }),
  chat: z.object({
    title: z.string(),
    subtitle: z.string(),
    caption: z.string(),
    messages: z
      .array(
        z.object({
          from: z.enum(["bot", "user"]),
          text: z.string(),
          buttons: z.array(z.string()).optional(),
          file: z.string().optional(),
        }),
      )
      .min(1),
  }),
  steps: z.object({ ...sectionHead, lead: z.string(), items: z.array(z.object({ title: z.string(), body: z.string() })).min(1) }),
  video: z.object({
    ...sectionHead,
    lead: z.string(),
    src: z.string().regex(/^\/media\/.+\.mp4$/),
    poster: z.string().regex(/^\/media\/.+\.(jpe?g|png|webp)$/),
    duration: z.string(),
  }),
  roles: z.object({
    ...sectionHead,
    lead: z.string(),
    items: z
      .array(
        z.object({
          id: slug,
          label: z.string(),
          audience: z.string(),
          summary: z.string(),
          features: z.array(z.object({ button: z.string(), body: z.string() })).min(1),
        }),
      )
      .min(1),
  }),
  certificates: z.object({ ...sectionHead, body: z.string(), points: z.array(z.string()), cta: z.string() }),
  schools: z.object({
    ...sectionHead,
    lead: z.string(),
    models: z.array(z.object({ title: z.string(), body: z.string() })),
    points: z.array(z.string()),
    cta: z.string(),
  }),
  faq: z.object({
    ...sectionHead,
    items: z.array(
      z.object({
        q: z.string(),
        a: z.string(),
        link: z.object({ label: z.string(), href: z.string().startsWith("/") }).optional(),
      }),
    ),
  }),
  finalCta: z.object({ title: z.string(), body: z.string(), secondary: z.string() }),
});

export type Site = z.infer<typeof SiteSchema>;
export type Pages = z.infer<typeof PagesSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type BotPage = z.infer<typeof BotPageSchema>;

/** Route helpers (pure). These URLs are live and printed on certificates; never change them. */
export const certificateRoute = (course: string, slug: string) => `/certificates/${course}/${slug}/`;
export const courseRoute = (course: string) => `/certificates/${course}/`;
