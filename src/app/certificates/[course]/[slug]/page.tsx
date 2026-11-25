import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getCertificates, getCertificate, courseRoute, site } from "@/lib/content";
import { absoluteUrl, asset } from "@/lib/url";
import { container } from "@/components/ui/styles";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { faDigits } from "@/components/ui/format";
import { ShieldCheck, ArrowBack, External } from "@/components/ui/icons";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";
import { CertificateActions } from "@/components/certificates/CertificateActions";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCertificates().map((c) => ({ course: c.course, slug: c.slug }));
}

type Props = PageProps<"/certificates/[course]/[slug]">;

function describe(c: NonNullable<ReturnType<typeof getCertificate>>) {
  const who = [c.salutation, c.nameFa].filter(Boolean).join(" ");
  return `${who} «${c.courseData.titleFa}» را ${c.courseData.partnerLabel} در ${faDigits(c.issuedOnFa)} با موفقیت گذرانده‌اند. گواهی صادرشده توسط ${site.name}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, slug } = await params;
  const cert = getCertificate(course, slug);
  if (!cert) return {};
  const url = absoluteUrl(cert.route);
  const title = `گواهی ${cert.nameFa} | ${cert.courseData.titleEn}`;
  const description = describe(cert);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} – ${site.name}`,
      description,
      images: cert.photo
        ? [{ url: absoluteUrl(cert.photo), width: 1920, height: 1357, alt: `گواهی ${cert.nameFa}` }]
        : [{ url: absoluteUrl(cert.courseData.badge), width: 250, height: 250 }],
    },
    twitter: { card: cert.photo ? "summary_large_image" : "summary" },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { course, slug } = await params;
  const cert = getCertificate(course, slug);
  if (!cert) notFound();

  const c = cert.courseData;
  const verifyUrl = absoluteUrl(cert.route);
  const qrSvg = await QRCode.toString(verifyUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#14180f", light: "#ffffff" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: `${c.titleFa} — ${cert.nameFa}`,
    credentialCategory: "certificate",
    url: verifyUrl,
    dateCreated: cert.issuedOn,
    recognizedBy: { "@type": "EducationalOrganization", name: `${site.name} | ${site.nameEn}`, url: absoluteUrl("/") },
    about: { "@type": "Course", name: c.titleFa, alternateName: c.titleEn },
  };

  const details: { label: string; value: ReactNode }[] = [
    { label: "دارندهٔ گواهی", value: [cert.salutation, cert.nameFa].filter(Boolean).join(" ") },
    { label: "نام لاتین", value: <span lang="en" dir="ltr">{cert.nameEn}</span> },
    { label: "دوره", value: <Link href={courseRoute(c.slug)} className="font-bold text-brand-strong hover:underline underline-offset-4">{c.titleFa}</Link> },
    { label: "همکار آموزشی", value: c.partner },
    { label: "تاریخ صدور", value: faDigits(cert.issuedOnFa) },
    { label: "مدت آموزش", value: faDigits(c.durationFa) },
  ];

  return (
    <div className={`${container} py-8 sm:py-12 print:max-w-none print:p-0`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { label: "خانه", href: "/" },
            { label: "گواهی‌ها", href: "/certificates/" },
            { label: c.titleEn, href: courseRoute(c.slug) },
            { label: cert.nameFa },
          ]}
        />

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong ring-1 ring-brand/30">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">
                گواهی {cert.nameFa}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-brand-strong">
                گواهی معتبر — صادرشده توسط {site.name}
              </p>
            </div>
          </div>
          <CertificateActions
            url={verifyUrl}
            title={`گواهی ${cert.nameFa} – ${site.name}`}
            text={`گواهی «${c.titleFa}» — ${cert.nameFa}`}
          />
        </div>
      </div>

      <div className="mt-8 print:mt-0">
        <CertificateDocument cert={cert} verifyUrl={verifyUrl} qrSvg={qrSvg} />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] print:hidden">
        {cert.photo && (
          <figure>
            <div className="rounded-[1.75rem] border border-line bg-surface p-2.5 shadow-card sm:p-3">
              <div className="relative overflow-hidden rounded-[1.25rem] bg-surface-2">
                <Image
                  src={cert.photo}
                  alt={`نسخهٔ تصویری گواهی ${cert.nameFa} (${cert.nameEn})`}
                  width={1920}
                  height={1357}
                  sizes="(min-width: 1024px) 680px, 92vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-3">
              <span>نسخهٔ تصویری گواهی صادرشده</span>
              <a
                href={asset(cert.photo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-brand-strong hover:underline underline-offset-4"
              >
                مشاهده در اندازهٔ کامل
                <External className="size-4" />
                <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
              </a>
            </figcaption>
          </figure>
        )}

        <aside aria-labelledby="details-title" className="self-start rounded-card border border-line bg-surface p-6 shadow-card">
          <h2 id="details-title" className="text-lg font-black text-ink">
            مشخصات گواهی
          </h2>
          <dl className="mt-4 divide-y divide-line">
            {details.map((d) => (
              <div key={d.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <dt className="text-sm text-ink-3">{d.label}</dt>
                <dd className="font-semibold text-ink">{d.value}</dd>
              </div>
            ))}
            <div className="py-3">
              <dt className="text-sm text-ink-3">نشانی اعتبارسنجی</dt>
              <dd lang="en" dir="ltr" className="mt-1 break-all text-end font-mono text-sm text-ink-2">
                {verifyUrl}
              </dd>
            </div>
          </dl>
          <Link
            href={courseRoute(c.slug)}
            className="mt-4 inline-flex items-center gap-2 font-bold text-brand-strong hover:underline underline-offset-4"
          >
            <ArrowBack className="size-4" />
            بازگشت به صفحهٔ دوره
          </Link>
        </aside>
      </div>
    </div>
  );
}
