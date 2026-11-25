import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourses, getCourse, getCertificates, courseRoute, site } from "@/lib/content";
import { absoluteUrl } from "@/lib/url";
import { container } from "@/components/ui/styles";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Diamond, DiamondRule } from "@/components/ui/Diamond";
import { faDigits, faNumber } from "@/components/ui/format";
import { Calendar, Clock, Users, Sparkles, School, ArrowForward } from "@/components/ui/icons";
import { VerifyForm } from "@/components/certificates/VerifyForm";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/certificates/[course]">): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  const route = courseRoute(course.slug);
  const description = `${course.titleFa} ${course.partnerLabel}، ${faDigits(course.heldOnFa)} — فهرست دانش‌آموختگان و گواهی‌ها.`;
  return {
    title: course.titleFa,
    description,
    alternates: { canonical: absoluteUrl(route) },
    openGraph: {
      url: absoluteUrl(route),
      title: `${course.titleFa} – ${site.name}`,
      description,
      images: [{ url: absoluteUrl(course.badge), width: 250, height: 250 }],
    },
  };
}

export default async function CoursePage({ params }: PageProps<"/certificates/[course]">) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const graduates = getCertificates(course.slug);

  const stats = [
    { icon: Calendar, label: "تاریخ برگزاری", value: faDigits(course.heldOnFa) },
    { icon: Clock, label: "مدت آموزش", value: faDigits(course.durationFa) },
    { icon: Users, label: "دانش‌آموختگان", value: `${faNumber(graduates.length)} نفر` },
    { icon: Sparkles, label: "ابزارها", value: `${faNumber(course.tools.length)} ابزار` },
  ];

  return (
    <>
      <header className="relative overflow-hidden border-b border-line bg-surface-2/60">
        <div className="motif-lattice absolute inset-0 opacity-20" aria-hidden="true" />
        <div className={`${container} relative py-10 sm:py-14`}>
          <Breadcrumbs
            items={[
              { label: "خانه", href: "/" },
              { label: "گواهی‌ها", href: "/certificates/" },
              { label: course.titleEn },
            ]}
          />
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p lang="en" dir="ltr" className="text-end text-sm font-bold uppercase tracking-[0.2em] text-brand-strong">
                {course.titleEn} Workshop
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">{course.titleFa}</h1>
              <p className="mt-4 flex items-center gap-2 text-lg text-ink-2">
                <School className="size-5 shrink-0 text-brand-strong" />
                {course.partnerLabel}
              </p>
            </div>
            <div className="relative mx-auto size-36 shrink-0 sm:size-44 lg:mx-0">
              <Diamond className="absolute inset-0 size-full text-gold opacity-20" />
              <Image
                src={course.badge}
                alt="نشان گواهی کارگاه"
                width={250}
                height={250}
                sizes="176px"
                preload
                className="relative size-full p-6 drop-shadow-lg"
              />
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                <dt className="flex items-center gap-2 text-sm text-ink-3">
                  <s.icon className="size-4 text-brand-strong" />
                  {s.label}
                </dt>
                <dd className="mt-2 text-lg font-black text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Tools */}
      <section aria-labelledby="tools-title" className="py-14 sm:py-16">
        <div className={container}>
          <h2 id="tools-title" className="text-2xl font-black text-ink">
            ابزارهایی که آموزش داده شد
          </h2>
          <p className="mt-2 text-ink-2">کار عملی با {faNumber(course.tools.length)} ابزار هوش مصنوعی برای آموزش و تولید محتوا.</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {course.tools.map((t) => (
              <li key={t.name} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 sm:p-4">
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-line">
                  <Image src={t.logo} alt="" width={64} height={64} sizes="44px" className="size-full object-contain" />
                </span>
                <span lang="en" dir="ltr" className="min-w-0 truncate font-bold text-ink">
                  {t.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Graduates */}
      <section aria-labelledby="grads-title" className="border-t border-line bg-surface-2/40 py-14 sm:py-16">
        <div className={container}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="grads-title" className="text-2xl font-black text-ink">
                دانش‌آموختگان
              </h2>
              <p className="mt-2 text-ink-2">
                {faNumber(graduates.length)} گواهی صادرشده. برای دیدن هر گواهی، روی نام دارندهٔ آن بزنید.
              </p>
            </div>
            <div className="lg:w-96">
              <VerifyForm id="course-verify" compact />
            </div>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {graduates.map((g) => (
              <li key={g.slug}>
                <Link
                  href={g.route}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:border-brand"
                >
                  <div className="relative aspect-[1920/1357] overflow-hidden border-b border-line bg-surface-2">
                    {g.photo ? (
                      <Image
                        src={g.photo}
                        alt={`تصویر گواهی ${g.nameFa}`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Diamond className="size-16 text-brand opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-black text-ink">
                        {g.salutation && <span className="me-1 text-sm font-semibold text-ink-3">{g.salutation}</span>}
                        {g.nameFa}
                      </p>
                      <p lang="en" dir="ltr" className="truncate text-end text-sm text-ink-3">
                        {g.nameEn}
                      </p>
                    </div>
                    <ArrowForward className="size-5 shrink-0 text-ink-3 transition-transform group-hover:-translate-x-1 group-hover:text-brand-strong" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <DiamondRule className="mt-14" />
        </div>
      </section>
    </>
  );
}
