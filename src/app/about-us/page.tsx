import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pages, site } from "@/lib/content";
import { ogBase } from "@/lib/seo";
import { absoluteUrl } from "@/lib/url";
import { PageHeader } from "@/components/ui/PageHeader";
import { Diamond } from "@/components/ui/Diamond";
import { container, btnPrimary, btnSecondary } from "@/components/ui/styles";
import { NumberBadge } from "@/components/ui/NumberBadge";
import { Bolt, HandHeart, Inclusive, ArrowForward } from "@/components/ui/icons";
import { Reveal, Stagger } from "@/components/motion/Reveal";

const about = pages.about;

export const metadata: Metadata = {
  title: about.title,
  description: about.intro,
  alternates: { canonical: absoluteUrl("/about-us/") },
  openGraph: { ...ogBase, url: absoluteUrl("/about-us/"), title: `${about.title} – ${site.name}`, description: about.intro },
};

/** Each value gets its own icon and accent so the three cards read as distinct ideas. */
const VALUE_STYLES = [
  { icon: Bolt, accent: "text-brand", tint: "bg-brand-soft", bar: "bg-brand", badge: "brand" },
  { icon: HandHeart, accent: "text-gold", tint: "bg-gold-soft", bar: "bg-gold", badge: "gold" },
  { icon: Inclusive, accent: "text-brand-strong", tint: "bg-surface-2", bar: "bg-brand-strong", badge: "outline" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${site.name} · ${site.nameEn}`}
        title={about.title}
        lead={<p>{about.intro}</p>}
        image={{ src: "/images/2025/01/Photo-by-Dose-Media-on-Unsplash.jpg", position: "left 42%" }}
      />

      <section aria-labelledby="values-title" className="py-16 sm:py-20">
        <div className={container}>
          <h2 id="values-title" className="sr-only">
            اهداف و ارزش‌های ما
          </h2>
          <Stagger as="ol" step={110} className="grid gap-6 md:grid-cols-3">
            {about.values.map((v, i) => {
              const s = VALUE_STYLES[i % VALUE_STYLES.length];
              return (
                <li
                  key={v.title}
                  className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface p-7 shadow-card transition-[translate,box-shadow] duration-300 ease-out hover:shadow-lift motion-safe:hover:-translate-y-1 sm:p-8"
                >
                  <span className={`absolute inset-x-0 top-0 h-1.5 ${s.bar}`} aria-hidden="true" />
                  <Diamond
                    className={`pointer-events-none absolute -bottom-10 -end-10 size-40 opacity-[0.08] transition-transform duration-500 group-hover:rotate-12 ${s.accent}`}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex size-14 items-center justify-center rounded-2xl ${s.tint}`}>
                      <s.icon className={`size-7 ${s.accent === "text-gold" ? "text-ink" : "text-brand-strong"}`} />
                    </span>
                    <NumberBadge value={i + 1} variant={s.badge} />
                  </div>
                  <h3 className="mt-6 text-xl font-black text-ink sm:text-2xl">{v.title}</h3>
                  <p className="mt-3 leading-8 text-ink-2">{v.body}</p>
                </li>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section aria-label="سخن پایانی" className="pb-4">
        <div className={container}>
          <Reveal as="figure" className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-line bg-brand-soft px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="motif-lattice absolute inset-0 opacity-20" aria-hidden="true" />
            <Image
              src={site.logo.mark}
              alt=""
              width={256}
              height={256}
              sizes="56px"
              className="relative mx-auto size-14 rounded-2xl shadow-card"
            />
            <blockquote className="relative mt-6 text-lg font-semibold leading-9 text-ink sm:text-xl sm:leading-10">
              <p>{about.closing}</p>
            </blockquote>
            <figcaption className="relative mt-4 text-sm font-bold text-brand-strong">— تیم {site.name}</figcaption>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact-us/" className={btnPrimary}>
                با ما در ارتباط باشید
                <ArrowForward className="size-4" />
              </Link>
              <Link href="/certificates/" className={btnSecondary}>
                گواهی‌ها
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
