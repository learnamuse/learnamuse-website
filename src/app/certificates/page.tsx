import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCourses, getCertificates, courseRoute, site } from "@/lib/content";
import { ogBase } from "@/lib/seo";
import { absoluteUrl } from "@/lib/url";
import { PageHeader } from "@/components/ui/PageHeader";
import { container, cardLift } from "@/components/ui/styles";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { faDigits, faNumber } from "@/components/ui/format";
import { Calendar, Clock, Users, ArrowForward, School } from "@/components/ui/icons";
import { CertificateSearch, type SearchEntry } from "@/components/certificates/CertificateSearch";

const title = "استعلام گواهی‌ها";
const description = "اصالت گواهی‌های صادرشده توسط لرناموز را با جست‌وجوی نام دارندهٔ گواهی بررسی کنید.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/certificates/") },
  openGraph: { ...ogBase, url: absoluteUrl("/certificates/"), title: `${title} – ${site.name}`, description },
};

export default function CertificatesPage() {
  const courses = getCourses();
  const entries: SearchEntry[] = getCertificates().map((c) => ({
    route: c.route,
    nameFa: c.nameFa,
    nameEn: c.nameEn,
    salutation: c.salutation,
    courseTitle: c.courseData.titleFa,
    issuedOnFa: c.issuedOnFa,
  }));

  return (
    <>
      <PageHeader
        eyebrow="گواهی‌های لرناموز"
        title={title}
        image={{ src: "/images/2025/01/Photo-by-Tirachard-Kumtanom.jpg", position: "left 40%" }}
        lead={
          <p>
            هر گواهی لرناموز یک صفحهٔ اختصاصی با نشانی ثابت روی همین وب‌سایت دارد. اگر گواهی‌ای در این فهرست باشد، یعنی
            توسط لرناموز صادر شده است.
          </p>
        }
      />

      <section aria-label="جست‌وجوی گواهی" className="py-12 sm:py-16">
        <Reveal className={`${container} max-w-3xl`}>
          <CertificateSearch entries={entries} />
        </Reveal>
      </section>

      <section aria-labelledby="courses-title" className="pb-8">
        <div className={container}>
          <Reveal className="flex items-end justify-between gap-4 border-b border-line pb-4">
            <h2 id="courses-title" className="text-2xl font-black text-ink">
              دوره‌ها و کارگاه‌ها
            </h2>
            <span className="text-sm text-ink-3">{faNumber(courses.length)} دوره</span>
          </Reveal>
          <Stagger as="ul" step={100} className="mt-8 grid gap-6 md:grid-cols-2">
            {courses.map((course) => {
              const count = getCertificates(course.slug).length;
              return (
                <li key={course.slug}>
                  <Link
                    href={courseRoute(course.slug)}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface p-6 shadow-card hover:border-brand sm:p-8 ${cardLift}`}
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={course.badge}
                        alt=""
                        width={250}
                        height={250}
                        sizes="64px"
                        className="size-16 shrink-0 transition-[rotate,scale] duration-500 ease-out motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-6"
                      />
                      <div className="min-w-0">
                        <p lang="en" dir="ltr" className="text-end text-xs font-bold uppercase tracking-widest text-brand-strong">
                          {course.titleEn}
                        </p>
                        <h3 className="mt-1 text-xl font-black leading-8 text-ink">{course.titleFa}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
                          <School className="size-4 shrink-0" />
                          {course.partnerLabel}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-3 text-center text-sm">
                      <div>
                        <dt className="sr-only">تاریخ برگزاری</dt>
                        <dd className="flex flex-col items-center gap-1 text-ink-2">
                          <Calendar className="size-4 text-brand-strong" />
                          {faDigits(course.heldOnFa)}
                        </dd>
                      </div>
                      <div>
                        <dt className="sr-only">مدت</dt>
                        <dd className="flex flex-col items-center gap-1 text-ink-2">
                          <Clock className="size-4 text-brand-strong" />
                          {faDigits(course.durationFa)}
                        </dd>
                      </div>
                      <div>
                        <dt className="sr-only">تعداد گواهی</dt>
                        <dd className="flex flex-col items-center gap-1 text-ink-2">
                          <Users className="size-4 text-brand-strong" />
                          {faNumber(count)} گواهی
                        </dd>
                      </div>
                    </dl>
                    <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-strong">
                      مشاهدهٔ دانش‌آموختگان
                      <ArrowForward className="size-4 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </Stagger>
        </div>
      </section>
    </>
  );
}
