import type { Metadata } from "next";
import Link from "next/link";
import { bot, site } from "@/lib/content";
import { ogBase } from "@/lib/seo";
import { absoluteUrl, asset } from "@/lib/url";
import { container, btnPrimary, btnSecondary, eyebrow as eyebrowCls } from "@/components/ui/styles";
import { Diamond, DiamondRule } from "@/components/ui/Diamond";
import { faNumber } from "@/components/ui/format";
import { ArrowForward, Check, External, ShieldCheck, School } from "@/components/ui/icons";
import { Bear } from "@/components/bot/Bear";
import { ChatDemo } from "@/components/bot/ChatDemo";
import { RoleTabs } from "@/components/bot/RoleTabs";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import styles from "@/components/bot/bot.module.css";

const ROUTE = "/bale-bot/";
const OG_IMAGE = "/images/bot/og-bale-bot.png";

export const metadata: Metadata = {
  title: bot.meta.title,
  description: bot.meta.description,
  alternates: { canonical: absoluteUrl(ROUTE) },
  openGraph: {
    ...ogBase,
    url: absoluteUrl(ROUTE),
    title: `${bot.meta.title} – ${site.name}`,
    description: bot.meta.description,
    images: [
      {
        url: absoluteUrl(OG_IMAGE),
        width: 1200,
        height: 630,
        alt: "خرس سبز لرناموز با گوشی و لوگوی لرناموز",
      },
    ],
  },
};

/** Primary call to action: opens the bot in Bale (new tab). */
function BotLink({ className = btnPrimary, label = bot.hero.primaryCta }: { className?: string; label?: string }) {
  return (
    <a href={bot.botUrl} target="_blank" rel="noopener" className={className}>
      {label}
      <External className="size-4" />
      <span className="sr-only">(در بله، در زبانهٔ تازه باز می‌شود)</span>
    </a>
  );
}

function SectionHead({
  id,
  eyebrow,
  title,
  lead,
  center = true,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={eyebrowCls}>
        <Diamond className="size-3" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 text-2xl font-black leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-base leading-8 text-ink-2 sm:text-lg">{lead}</p>}
    </Reveal>
  );
}

export default function BaleBotPage() {
  const { hero, chat, steps, video, roles, certificates, schools, faq, finalCta } = bot;

  return (
    <>
      {/* ------------------------------------------------------------------ Hero */}
      <section aria-labelledby="bot-hero-title" className="relative isolate overflow-hidden bg-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -top-40 end-[-10%] size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(127_209_65/0.22),rgb(127_209_65/0))]" />
          <div className="absolute -bottom-48 start-[-15%] size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(242_181_68/0.14),rgb(242_181_68/0))]" />
          <div className="motif-lattice absolute inset-0 opacity-[0.12]" />
        </div>

        <div className={`${container} grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16`}>
          <div className="motion-enter text-center lg:text-start">
            <p className={eyebrowCls}>
              <Diamond className="size-3" />
              {hero.eyebrow}
            </p>
            <h1
              id="bot-hero-title"
              className="mt-5 text-[2rem] font-black leading-[1.25] tracking-tight text-ink min-[400px]:text-4xl sm:text-5xl lg:text-[3.4rem] lg:leading-[1.2]"
            >
              {hero.title}{" "}
              <span className="relative mt-1 block text-brand-strong">
                <span className="relative">
                  — {hero.titleAccent}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 start-0 h-3 w-full text-gold"
                  >
                    <path d="M2 10C50 3 120 1 198 7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-ink-2 sm:text-lg sm:leading-9 lg:mx-0">{hero.lead}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <BotLink className={`${btnPrimary} px-6 py-3.5 shadow-card`} />
              <a href="#how" className={btnSecondary}>
                {hero.secondaryCta}
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-3">
              یا در بله جست‌وجو کنید:{" "}
              <span dir="ltr" className="font-bold text-brand-strong">
                {bot.botHandle}
              </span>
            </p>

            <ul className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="ویژگی‌های کلیدی">
              {hero.chips.map((c) => (
                <li
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-sm font-semibold text-ink-2"
                >
                  <Check className="size-4 text-brand-strong" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* phone with the animated chat, and the bear waving beside it */}
          <div className="motion-enter flex items-end justify-center [--enter-base:260ms] [--enter-step:160ms]">
            <ChatDemo chat={chat} logo={site.logo.mark} className="w-[14.75rem] flex-none sm:w-[19rem] lg:w-[20rem]" />
            {/* RTL: the phone comes first (right), the bear stands at its left, overlapping only the frame */}
            <Bear
              pose="wave"
              preload
              sizes="(min-width: 1024px) 216px, (min-width: 640px) 176px, 108px"
              className="relative z-10 -ms-3 mb-9 w-[6.25rem] flex-none sm:-ms-6 sm:w-[11rem] lg:-ms-8 lg:w-[13.5rem]"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ How it works */}
      <section id="how" aria-labelledby="how-title" className="border-y border-line bg-surface-2/60 py-16 sm:py-24">
        <div className={container}>
          <SectionHead id="how-title" eyebrow={steps.eyebrow} title={steps.title} lead={steps.lead} />
          <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {/* connecting line on wide screens */}
            <span
              aria-hidden="true"
              className="absolute inset-x-[10%] top-7 hidden h-0.5 bg-linear-to-l from-brand/0 via-brand/50 to-brand/0 lg:block"
            />
            {steps.items.map((s, i) => (
              <li key={s.title} className={i === steps.items.length - 1 ? "sm:col-span-2 lg:col-span-1" : undefined}>
                <Reveal
                  delay={i * 90}
                  className="relative flex h-full items-start gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:flex-col sm:items-center sm:p-6 sm:text-center"
                >
                  <span className="relative flex size-12 shrink-0 items-center justify-center sm:size-14">
                    <Diamond className="absolute inset-0 size-full text-brand" />
                    <span className="relative text-lg font-black text-brand-ink">{faNumber(i + 1)}</span>
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-ink">{s.title}</h3>
                    <p className="mt-1.5 text-[0.95rem] leading-7 text-ink-2 sm:mt-2">{s.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ Video */}
      <section aria-labelledby="video-title" className="py-16 sm:py-24">
        <div className={container}>
          <SectionHead id="video-title" eyebrow={video.eyebrow} title={video.title} lead={video.lead} />
          <Reveal className="relative mx-auto mt-10 max-w-4xl">
            <div
              aria-hidden="true"
              className="absolute -inset-3 -z-10 rounded-[2.4rem] bg-linear-to-br from-brand/25 via-brand-soft to-gold/25 blur-xl"
            />
            <video
              controls
              preload="none"
              playsInline
              width={1280}
              height={720}
              poster={asset(video.poster)}
              className="aspect-video w-full rounded-[2rem] border border-line bg-surface-2 shadow-card"
              aria-label={video.title}
            >
              <source src={asset(video.src)} type="video/mp4" />
              مرورگر شما پخش ویدئو را پشتیبانی نمی‌کند.{" "}
              <a href={asset(video.src)} className="underline">
                دانلود ویدئو
              </a>
            </video>
            <p className="mt-3 text-center text-sm text-ink-3">{video.duration}</p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ Roles */}
      <section aria-labelledby="roles-title" className="bg-linear-to-b from-white to-brand-soft/50 py-16 sm:py-24">
        <div className={container}>
          <SectionHead id="roles-title" eyebrow={roles.eyebrow} title={roles.title} lead={roles.lead} />
          <div className="mt-10">
            <RoleTabs roles={roles.items} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Certificates */}
      <section aria-labelledby="cert-title" className="py-16 sm:py-24">
        <div className={container}>
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-line bg-linear-to-br from-gold-soft via-white to-brand-soft px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(242_181_68/0.22),rgb(242_181_68/0))]"
            />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-ink ring-1 ring-gold/50 sm:text-sm">
                  <ShieldCheck className="size-4 text-brand-strong" />
                  {certificates.eyebrow}
                </p>
                <h2 id="cert-title" className="mt-4 text-2xl font-black leading-tight text-ink sm:text-3xl lg:text-4xl">
                  {certificates.title}
                </h2>
                <p className="mt-4 max-w-xl leading-8 text-ink-2 sm:text-lg sm:leading-9">{certificates.body}</p>
                <ul className="mt-6 space-y-3">
                  {certificates.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-ink">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink">
                        <Check className="size-4" />
                      </span>
                      <span className="font-semibold leading-7">{p}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/certificates/" className={`${btnPrimary} mt-8`}>
                  {certificates.cta}
                  <ArrowForward className="size-4" />
                </Link>
              </div>
              <Bear pose="celebrate" slow sizes="(min-width: 1024px) 400px, 72vw" className="mx-auto w-[72%] max-w-[22rem] lg:w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Schools */}
      <section aria-labelledby="schools-title" className="border-y border-line bg-surface-2/60 py-16 sm:py-24">
        <div className={container}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHead id="schools-title" eyebrow={schools.eyebrow} title={schools.title} lead={schools.lead} center={false} />
              <ul className="mt-6 space-y-3">
                {schools.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 leading-7 text-ink-2">
                    <Check className="mt-1 size-5 shrink-0 text-brand-strong" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/contact-us/" className={`${btnPrimary} mt-8`}>
                <School className="size-5" />
                {schools.cta}
              </Link>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {schools.models.map((m, i) => (
                <li key={m.title}>
                  <Reveal
                    delay={i * 80}
                    className="relative h-full overflow-hidden rounded-card border border-line bg-surface p-6 shadow-card"
                  >
                    <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-l from-brand to-gold" aria-hidden="true" />
                    <span className="text-4xl font-black text-brand/35" aria-hidden="true">
                      {faNumber(i + 1)}
                    </span>
                    <h3 className="mt-2 text-lg font-black text-ink">{m.title}</h3>
                    <p className="mt-2 leading-7 text-ink-2">{m.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- FAQ */}
      <section aria-labelledby="faq-title" className="py-16 sm:py-24">
        <div className={`${container} max-w-3xl`}>
          <SectionHead id="faq-title" eyebrow={faq.eyebrow} title={faq.title} />
          <Stagger className="mt-10 space-y-3" step={60}>
            {faq.items.map((f) => (
              <details
                key={f.q}
                className="faq group rounded-card border border-line bg-surface shadow-card transition-colors duration-300 open:border-brand/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-start font-bold text-ink sm:text-lg [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className={`${styles.faqIcon} size-4`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 leading-8 text-ink-2">
                  <p>{f.a}</p>
                  {f.link && (
                    <Link
                      href={f.link.href}
                      className="mt-2 inline-flex items-center gap-1.5 font-bold text-brand-strong underline decoration-brand/40 decoration-2 underline-offset-4 hover:decoration-brand"
                    >
                      {f.link.label}
                      <ArrowForward className="size-4" />
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </Stagger>
        </div>
      </section>

      {/* -------------------------------------------------------------- Final CTA */}
      <section aria-labelledby="final-title" className="pb-16 sm:pb-20">
        <div className={container}>
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-soft via-white to-brand-soft px-6 pt-10 ring-1 ring-line sm:px-12 lg:pt-0">
            <div className="motif-lattice absolute inset-0 opacity-25" aria-hidden="true" />
            <div className="relative grid items-end gap-6 lg:grid-cols-[1.4fr_1fr] lg:pt-10">
              <div className="text-center lg:py-16 lg:text-start">
                <DiamondRule className="lg:justify-start" />
                <h2 id="final-title" className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">
                  {finalCta.title}
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-8 text-ink-2 sm:text-lg sm:leading-9 lg:mx-0">{finalCta.body}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <BotLink className={`${btnPrimary} px-6 py-3.5 shadow-card`} />
                  <Link href="/contact-us/" className={btnSecondary}>
                    {finalCta.secondary}
                  </Link>
                </div>
              </div>
              <Bear pose="phone" sizes="(min-width: 1024px) 320px, 220px" className="mx-auto w-[13.5rem] sm:w-[16rem] lg:w-[19rem]" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
