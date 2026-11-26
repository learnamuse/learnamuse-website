import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pages, site, getCourse, getCertificates, courseRoute } from "@/lib/content";
import { ogBase } from "@/lib/seo";
import { absoluteUrl } from "@/lib/url";
import { container, btnPrimary, btnSecondary, eyebrow, cardLift } from "@/components/ui/styles";
import { Diamond, DiamondRule } from "@/components/ui/Diamond";
import { faDigits, faNumber } from "@/components/ui/format";
import { NumberBadge } from "@/components/ui/NumberBadge";
import { ArrowForward, ShieldCheck, Users, Sparkles, Clock, School } from "@/components/ui/icons";
import { VerifyForm } from "@/components/certificates/VerifyForm";
import { Bear } from "@/components/bot/Bear";
import { BaleIcon } from "@/components/contact/BaleIcon";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
      ...ogBase,
    url: absoluteUrl("/"),
    title: `${site.name} | ${site.nameEn}`,
    description: site.tagline,
    images: [{ url: absoluteUrl(pages.home.hero.image), width: 1920, height: 1282 }],
  },
};

/** Intrinsic sizes of the feature photos (aspect ratio only; they're cropped to 4:3). */
const IMAGE_DIMS: Record<string, [number, number]> = {
  "/images/2025/01/pexels-tara-winstead-8386139_2.jpg": [1920, 1280],
  "/images/2025/01/3535.jpg": [1024, 1024],
  "/images/2025/01/werwer.jpg": [1024, 1024],
};

export default function Home() {
  const { hero, features } = pages.home;
  const course = getCourse("aitoolbox");
  const graduates = course ? getCertificates(course.slug) : [];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      {/*
       * Full-bleed photo from the old site: notebook + pen (top left) and a plant (top right)
       * on a white desk. The objects fill the top of the frame; the copy sits on the white
       * lower area, as on learnamuse.com. On phones the frame is zoomed toward its right half
       * so the notebook spiral and the plant stay large, with the text below them.
       */}
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="motion-parallax absolute top-0 -z-10 aspect-[1920/1282] w-[175%] overflow-hidden left-[-72%] sm:w-[130%] sm:left-[-30%] lg:inset-x-0 lg:w-full lg:-top-[3vw]"
        >
          {/* slow Ken-Burns drift (CSS only); the wrapper adds a light scroll-linked parallax where supported */}
          <Image
            src={hero.image}
            alt=""
            fill
            preload
            sizes="(min-width: 1024px) 100vw, 175vw"
            className="motion-kenburns object-cover"
          />
          {/* blend the photo's lower edge into the page white */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-white/0 to-white" />
        </div>
        {/* soft white halo behind the copy so it reads cleanly over any part of the photo */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-[62%] bg-[radial-gradient(ellipse_60%_70%_at_50%_60%,white_40%,rgb(255_255_255/0)_100%)]"
        />

        <div
          className={`${container} motion-enter flex flex-col items-center pb-6 pt-[56vw] text-center sm:pb-8 sm:pt-[36vw] lg:pb-10 lg:pt-[min(27vw,34rem)]`}
        >
          <p className={`${eyebrow} ring-1 ring-brand/20`}>
            <Diamond className="size-3.5 text-brand" />
            {site.name}
            <span aria-hidden="true" className="text-ink-3">
              ·
            </span>
            <span lang="en" dir="ltr" className="font-semibold">
              {site.nameEn}
            </span>
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-4xl font-black leading-[1.25] tracking-tight text-brand-strong sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>
          <DiamondRule className="mt-5" />
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-2 sm:text-lg sm:leading-9">{hero.lead}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact-us/" className={btnPrimary}>
              با ما در ارتباط باشید
              <ArrowForward className="size-4" />
            </Link>
            <Link href="/certificates/" className={btnSecondary}>
              <ShieldCheck className="size-5 text-brand-strong" />
              استعلام گواهی
            </Link>
          </div>
          {course && (
            <Link
              href={courseRoute(course.slug)}
              className={`mt-10 inline-flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 pe-5 text-start shadow-card hover:border-brand ${cardLift}`}
            >
              <Image src={course.badge} alt="" width={250} height={250} sizes="48px" className="size-11" />
              <span className="text-sm leading-6">
                <span className="block font-black text-ink">{faNumber(graduates.length)} گواهی صادرشده</span>
                <span className="block text-ink-2">کارگاه جعبه‌ابزار هوش‌مصنوعی</span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ Bale bot band */}
      <section aria-labelledby="bot-band-title" className="pt-4 sm:pt-8">
        <div className={container}>
          <Reveal className="relative grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[2rem] bg-brand-soft p-6 ring-1 ring-brand/25 sm:p-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className={eyebrow}>ربات لرناموز در بله</p>
              <h2 id="bot-band-title" className="mt-3 text-2xl font-black leading-tight text-ink sm:text-3xl">
                ثبت‌نام، کلاس، پرداخت و تکلیف؛ همه در یک گفتگو
              </h2>
              <p className="mt-3 max-w-xl leading-8 text-ink-2">
                بدون نصب برنامهٔ جدید، از داخل پیام‌رسان بله کلاس بگیرید، برنامه‌تان را ببینید و گواهی پایان دوره دریافت کنید.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={site.contact.bale} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                  <BaleIcon className="size-5" />
                  شروع گفتگو با ربات
                  <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
                </a>
                <Link href="/bale-bot/" className={btnSecondary}>
                  بیشتر بدانید
                  <ArrowForward className="size-4" />
                </Link>
              </div>
            </div>
            <Bear pose="point" sizes="(min-width: 768px) 200px, 160px" className="mx-auto w-40 md:w-52" decorative />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section aria-labelledby="features-title" className="py-16 sm:py-24">
        <div className={container}>
          <Reveal className="mx-auto max-w-2xl text-center">
            <DiamondRule />
            <h2 id="features-title" className="mt-4 text-3xl font-black text-ink sm:text-4xl">
              نگاه ما به یادگیری
            </h2>
            <p className="mt-4 leading-8 text-ink-2">سه ایده‌ای که پشت هر کاری است که در لرناموز انجام می‌دیم.</p>
          </Reveal>

          <ol className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
            {features.map((f, i) => (
              <li key={f.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                {/* RTL: the first column is on the right. Each half slides in from its own side. */}
                <Reveal variant={i % 2 === 1 ? "end" : "start"} className={i % 2 === 1 ? "md:order-2" : ""}>
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
                </Reveal>
                <Reveal variant={i % 2 === 1 ? "start" : "end"} delay={120}>
                  <div className="flex items-center gap-4" aria-hidden="true">
                    <NumberBadge value={i + 1} size="lg" />
                    {/* RTL: the rule starts at the badge (right) and fades out to the left. */}
                    <span className="h-0.5 flex-1 rounded-full bg-linear-to-l from-brand/60 via-line to-transparent" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-ink sm:text-3xl">{f.title}</h3>
                  <p className="mt-4 text-base leading-8 text-ink-2 sm:text-lg sm:leading-9">{f.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- AI Toolbox */}
      {course && (
        <section aria-labelledby="toolbox-title" className="py-4 sm:py-8">
          <div className={container}>
            <Reveal className="relative overflow-hidden rounded-[2rem] bg-brand-soft px-6 py-12 ring-1 ring-brand/25 sm:px-12 sm:py-16">
              <div className="motif-lattice absolute inset-0 opacity-25" aria-hidden="true" />
              <Diamond className="pointer-events-none absolute -bottom-10 start-1/3 size-28 text-gold opacity-25" />
              <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-strong ring-1 ring-brand/25">
                    <Sparkles className="size-4" />
                    کارگاه برگزارشده
                  </p>
                  <h2 id="toolbox-title" className="mt-5 text-3xl font-black leading-tight text-ink sm:text-4xl">
                    {course.titleFa}
                  </h2>
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-2">
                    <School className="size-5 shrink-0 text-brand-strong" />
                    {course.partnerLabel}
                    <span aria-hidden="true">·</span>
                    {faDigits(course.heldOnFa)}
                  </p>
                  <p className="mt-6 max-w-xl leading-8 text-ink-2">
                    یک کارگاه عملی برای آموزگاران: آشنایی و کار با ابزارهای هوش مصنوعی برای ساختن محتوای آموزشی تعاملی
                    و بهتر کردن روش‌های تدریس.
                  </p>

                  <Stagger as="dl" step={90} className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
                    {[
                      { icon: Users, value: graduates.length, label: "دانش‌آموخته" },
                      { icon: Sparkles, value: course.tools.length, label: "ابزار هوش مصنوعی" },
                      { icon: Clock, value: course.durationHours, label: "ساعت آموزش" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl bg-white p-3 text-center shadow-card ring-1 ring-brand/15 sm:p-4">
                        <dt className="sr-only">{s.label}</dt>
                        <dd>
                          <s.icon className="mx-auto size-5 text-brand-strong" />
                          <CountUp value={s.value} className="mt-2 text-3xl font-black text-ink" />
                          <span className="mt-1 block text-xs text-ink-2 sm:text-sm" aria-hidden="true">
                            {s.label}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </Stagger>

                  <Link
                    href={courseRoute(course.slug)}
                    className={`${btnPrimary} mt-8`}
                  >
                    دانش‌آموختگان و گواهی‌ها
                    <ArrowForward className="size-4" />
                  </Link>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold text-ink-2">ابزارهایی که با آن‌ها کار کردیم</h3>
                  <Stagger as="ul" variant="pop" step={45} max={11} className="grid grid-cols-4 gap-2 sm:gap-3">
                    {course.tools.map((t) => (
                      <li
                        key={t.name}
                        className="flex flex-col items-center gap-2 rounded-2xl bg-white px-1 py-2.5 text-center ring-1 ring-brand/15 sm:p-3"
                      >
                        <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-line sm:size-12">
                          <Image src={t.logo} alt="" width={64} height={64} sizes="48px" className="size-full object-contain" />
                        </span>
                        <span lang="en" dir="ltr" className="text-[0.7rem] leading-tight break-words text-ink-2 sm:text-xs">
                          {t.name}
                        </span>
                      </li>
                    ))}
                  </Stagger>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- Verify a cert */}
      <section aria-labelledby="verify-title" className="py-16 sm:py-24">
        <div className={container}>
          <Reveal className="grid grid-cols-1 items-center gap-8 rounded-[2rem] border border-line bg-surface p-6 shadow-card sm:p-10 lg:grid-cols-[auto_1fr_1.1fr] lg:gap-10">
            <Reveal
              as="span"
              variant="pop"
              delay={200}
              className="relative inline-flex size-20 items-center justify-center text-gold"
              aria-hidden="true"
            >
              <Diamond className="absolute inset-0 size-20 opacity-25" />
              <ShieldCheck className="relative size-9 text-ink" />
            </Reveal>
            <div>
              <h2 id="verify-title" className="text-2xl font-black text-ink sm:text-3xl">
                استعلام گواهی
              </h2>
              <p className="mt-3 leading-8 text-ink-2">
                هر گواهی لرناموز یک صفحهٔ اختصاصی و نشانی ثابت دارد. نام دارندهٔ گواهی را جست‌وجو کنید تا اصالتش را ببینید.
              </p>
            </div>
            <VerifyForm id="home-verify" />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ Closing CTA */}
      <section aria-labelledby="closing-title" className="pb-4">
        <Stagger className={`${container} text-center`} step={90}>
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
        </Stagger>
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
