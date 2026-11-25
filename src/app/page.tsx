import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pages, site, getCourse, getCertificates, courseRoute } from "@/lib/content";
import { ogBase } from "@/lib/seo";
import { absoluteUrl } from "@/lib/url";
import { container, btnPrimary, btnSecondary, eyebrow } from "@/components/ui/styles";
import { Diamond, DiamondRule } from "@/components/ui/Diamond";
import { faDigits, faNumber } from "@/components/ui/format";
import { ArrowForward, ShieldCheck, Users, Sparkles, Clock, School } from "@/components/ui/icons";
import { VerifyForm } from "@/components/certificates/VerifyForm";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
      ...ogBase,
    url: absoluteUrl("/"),
    title: `${site.name} | ${site.nameEn}`,
    description: site.tagline,
    images: [{ url: absoluteUrl(pages.home.hero.image), width: 1024, height: 1024 }],
  },
};

/** Intrinsic sizes of the feature photos (aspect ratio only; they're cropped to 4:3). */
const IMAGE_DIMS: Record<string, [number, number]> = {
  "/images/2025/01/pexels-tara-winstead-8386139_2.jpg": [1920, 1280],
  "/images/2025/01/3535.jpg": [1024, 1024],
  "/images/2025/01/werwer.jpg": [1024, 1024],
};

const FEATURE_ACCENTS = ["text-brand", "text-gold", "text-brand-strong"];

export default function Home() {
  const { hero, features } = pages.home;
  const course = getCourse("aitoolbox");
  const graduates = course ? getCertificates(course.slug) : [];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div className="motif-lattice absolute inset-0 opacity-25" aria-hidden="true" />
        <div className={`${container} relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24`}>
          <div>
            <p className={eyebrow}>
              <Diamond className="size-3.5 text-brand" />
              {site.name}
              <span aria-hidden="true" className="text-ink-3">·</span>
              <span lang="en" dir="ltr" className="font-semibold">
                {site.nameEn}
              </span>
            </p>
            <h1
              id="hero-title"
              className="mt-5 text-4xl font-black leading-[1.25] tracking-tight text-ink sm:text-5xl lg:text-6xl"
            >
              {hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-2 sm:text-lg sm:leading-9">{hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact-us/" className={btnPrimary}>
                با ما در ارتباط باشید
                <ArrowForward className="size-4" />
              </Link>
              <Link href="/certificates/" className={btnSecondary}>
                <ShieldCheck className="size-5 text-brand-strong" />
                استعلام گواهی
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* rotated "logo diamond" backdrop */}
            <div
              aria-hidden="true"
              className="absolute inset-6 rotate-45 rounded-[3rem] bg-brand-soft ring-1 ring-brand/20 sm:inset-10"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-2 shadow-card">
              <Image
                src={hero.image}
                alt="میز کاری با کتاب، لپ‌تاپ و یادداشت‌ها؛ تصویری از آموزش مبتنی بر شواهد"
                width={1024}
                height={1024}
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 90vw"
                preload
                className="aspect-square w-full rounded-[1.6rem] object-cover"
              />
            </div>
            {course && (
              <Link
                href={courseRoute(course.slug)}
                className="absolute -bottom-6 start-2 flex items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 pe-5 shadow-card backdrop-blur transition-transform hover:-translate-y-0.5 sm:start-[-1.5rem]"
              >
                <Image src={course.badge} alt="" width={250} height={250} sizes="48px" className="size-12" />
                <span className="text-sm leading-6">
                  <span className="block font-black text-ink">{faNumber(graduates.length)} گواهی صادرشده</span>
                  <span className="block text-ink-2">کارگاه جعبه‌ابزار هوش‌مصنوعی</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section aria-labelledby="features-title" className="py-16 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <DiamondRule />
            <h2 id="features-title" className="mt-4 text-3xl font-black text-ink sm:text-4xl">
              نگاه ما به یادگیری
            </h2>
            <p className="mt-4 leading-8 text-ink-2">سه ایده‌ای که پشت هر کاری است که در لرناموز انجام می‌دیم.</p>
          </div>

          <ol className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
            {features.map((f, i) => (
              <li key={f.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  {f.image ? (
                    <div className="overflow-hidden rounded-card border border-line bg-surface p-2 shadow-card">
                      <Image
                        src={f.image}
                        alt=""
                        width={IMAGE_DIMS[f.image]?.[0] ?? 1200}
                        height={IMAGE_DIMS[f.image]?.[1] ?? 900}
                        sizes="(min-width: 768px) 45vw, 92vw"
                        className="aspect-[4/3] w-full rounded-[calc(var(--radius)-0.4rem)] object-cover"
                      />
                    </div>
                  ) : (
                    <MotifArt />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`relative inline-flex size-12 items-center justify-center ${FEATURE_ACCENTS[i % 3]}`}
                      aria-hidden="true"
                    >
                      <Diamond className="absolute inset-0 size-12 opacity-20" />
                      <span className="relative text-lg font-black text-ink">{faNumber(i + 1)}</span>
                    </span>
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-ink sm:text-3xl">{f.title}</h3>
                  <p className="mt-4 text-base leading-8 text-ink-2 sm:text-lg sm:leading-9">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- AI Toolbox */}
      {course && (
        <section aria-labelledby="toolbox-title" className="py-4 sm:py-8">
          <div className={container}>
            <div className="relative overflow-hidden rounded-[2rem] bg-brand-ink px-6 py-12 text-white ring-1 ring-white/10 sm:px-12 sm:py-16">
              <Diamond className="pointer-events-none absolute -bottom-10 start-1/3 size-28 text-gold opacity-15" />
              <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-brand">
                    <Sparkles className="size-4" />
                    کارگاه برگزارشده
                  </p>
                  <h2 id="toolbox-title" className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                    {course.titleFa}
                  </h2>
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-white/80">
                    <School className="size-5 shrink-0 text-brand" />
                    {course.partnerLabel}
                    <span aria-hidden="true">·</span>
                    {faDigits(course.heldOnFa)}
                  </p>
                  <p className="mt-6 max-w-xl leading-8 text-white/85">
                    یک کارگاه عملی برای آموزگاران: آشنایی و کار با ابزارهای هوش مصنوعی برای ساختن محتوای آموزشی تعاملی
                    و بهتر کردن روش‌های تدریس.
                  </p>

                  <dl className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
                    {[
                      { icon: Users, value: faNumber(graduates.length), label: "دانش‌آموخته" },
                      { icon: Sparkles, value: faNumber(course.tools.length), label: "ابزار هوش مصنوعی" },
                      { icon: Clock, value: faNumber(course.durationHours), label: "ساعت آموزش" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl bg-white/[0.07] p-3 text-center ring-1 ring-white/10 sm:p-4">
                        <dt className="sr-only">{s.label}</dt>
                        <dd>
                          <s.icon className="mx-auto size-5 text-brand" />
                          <span className="mt-2 block text-3xl font-black">{s.value}</span>
                          <span className="mt-1 block text-xs text-white/75 sm:text-sm" aria-hidden="true">
                            {s.label}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <Link
                    href={courseRoute(course.slug)}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-brand-ink transition-colors hover:bg-white"
                  >
                    دانش‌آموختگان و گواهی‌ها
                    <ArrowForward className="size-4" />
                  </Link>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold text-white/75">ابزارهایی که با آن‌ها کار کردیم</h3>
                  <ul className="grid grid-cols-4 gap-2 sm:gap-3">
                    {course.tools.map((t) => (
                      <li
                        key={t.name}
                        className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.06] px-1 py-2.5 text-center ring-1 ring-white/10 sm:p-3"
                      >
                        <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 sm:size-12">
                          <Image src={t.logo} alt="" width={64} height={64} sizes="48px" className="size-full object-contain" />
                        </span>
                        <span lang="en" dir="ltr" className="text-[0.7rem] leading-tight break-words text-white/85 sm:text-xs">
                          {t.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- Verify a cert */}
      <section aria-labelledby="verify-title" className="py-16 sm:py-24">
        <div className={container}>
          <div className="grid grid-cols-1 items-center gap-8 rounded-[2rem] border border-line bg-surface p-6 shadow-card sm:p-10 lg:grid-cols-[auto_1fr_1.1fr] lg:gap-10">
            <span className="relative inline-flex size-20 items-center justify-center text-gold" aria-hidden="true">
              <Diamond className="absolute inset-0 size-20 opacity-25" />
              <ShieldCheck className="relative size-9 text-ink" />
            </span>
            <div>
              <h2 id="verify-title" className="text-2xl font-black text-ink sm:text-3xl">
                استعلام گواهی
              </h2>
              <p className="mt-3 leading-8 text-ink-2">
                هر گواهی لرناموز یک صفحهٔ اختصاصی و نشانی ثابت دارد. نام دارندهٔ گواهی را جست‌وجو کنید تا اصالتش را ببینید.
              </p>
            </div>
            <VerifyForm id="home-verify" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Closing CTA */}
      <section aria-labelledby="closing-title" className="pb-4">
        <div className={`${container} text-center`}>
          <DiamondRule />
          <h2 id="closing-title" className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight text-ink sm:text-4xl">
            بیایید با هم، یادگیری را بهتر کنیم
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-8 text-ink-2">
            معلم هستید، مدرسه‌ای را اداره می‌کنید یا فقط به آموزش علاقه دارید؟ خوشحال می‌شیم از شما بشنویم.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact-us/" className={btnPrimary}>
              ارسال پیام
              <ArrowForward className="size-4" />
            </Link>
            <Link href="/about-us/" className={btnSecondary}>
              بیشتر دربارهٔ ما
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/** Illustration for a feature without a photo: a field of logo diamonds, each a little different. */
function MotifArt() {
  const cells = [
    "text-brand",
    "text-gold",
    "text-brand-strong",
    "text-brand/60",
    "text-gold/70",
    "text-brand",
    "text-ink-3/50",
    "text-brand-strong/70",
    "text-gold",
  ];
  const sizes = ["size-14", "size-10", "size-16", "size-12", "size-16", "size-9", "size-12", "size-14", "size-10"];
  return (
    <div
      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card border border-line bg-brand-soft"
      aria-hidden="true"
    >
      <div className="motif-lattice absolute inset-0 opacity-30" />
      <div className="relative grid grid-cols-3 place-items-center gap-6 sm:gap-8">
        {cells.map((c, i) => (
          <Diamond key={i} className={`${sizes[i]} ${c} ${i % 2 ? "rotate-12" : "-rotate-6"}`} />
        ))}
      </div>
    </div>
  );
}
