import type { Metadata } from "next";
import { pages, site } from "@/lib/content";
import { ogBase } from "@/lib/seo";
import { absoluteUrl } from "@/lib/url";
import { PageHeader } from "@/components/ui/PageHeader";
import { container } from "@/components/ui/styles";
import { Telegram, External, Users, School, HandHeart, Clock, ShieldCheck } from "@/components/ui/icons";
import { BaleIcon } from "@/components/contact/BaleIcon";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { cardLift } from "@/components/ui/styles";

const contact = pages.contact;
const description =
  "راه‌های ارتباط با تیم لرناموز: ربات لرناموز در پیام‌رسان بله و پشتیبانی تلگرام، برای پرسش، پیشنهاد یا درخواست همکاری.";

export const metadata: Metadata = {
  title: contact.title,
  description,
  alternates: { canonical: absoluteUrl("/contact-us/") },
  openGraph: { ...ogBase, url: absoluteUrl("/contact-us/"), title: `${contact.title} – ${site.name}`, description },
};

const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Who usually writes to us, and the best route for each (wording follows the bot's support flow). */
const topics = [
  {
    icon: Users,
    title: "آموزندگان و خانواده‌ها",
    body: "ثبت‌نام، کلاس‌ها، جلسه‌ها و پرداخت‌ها را در ربات لرناموز پیگیری کنید؛ برای هر پرسش، بخش «☎️ پشتیبانی و گفتگوها» در ربات را بزنید.",
  },
  {
    icon: HandHeart,
    title: "آموزگاران",
    body: "اگر می‌خواهید با لرناموز همکاری آموزشی داشته باشید، در ربات لرناموز در بله یا در تلگرام به ما پیام بدهید.",
  },
  {
    icon: School,
    title: "مدارس و آموزشگاه‌ها",
    body: "برای همکاری مدرسه‌ها و آموزشگاه‌ها و راه‌اندازی ربات و پنل اختصاصی، در بله یا تلگرام پیام بگذارید تا برای هماهنگی با شما در ارتباط باشیم.",
  },
];

export default function ContactPage() {
  const { bale, baleHandle, telegram, telegramHandle } = site.contact;

  return (
    <>
      <PageHeader
        eyebrow="خوشحال می‌شیم از شما بشنویم"
        title={contact.title}
        image={{ src: "/images/2025/01/pexels-ann-poan-Photo-by-Ann-poan-1280x1080.jpg", position: "left 35%" }}
        lead={
          <p>
            {site.footer.cta} سریع‌ترین راه، گفتگو با ربات لرناموز در پیام‌رسان بله است؛ اگر به بله دسترسی ندارید، در تلگرام
            پیام بدهید.
          </p>
        }
      />

      <div className={`${container} grid items-start gap-8 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12`}>
        <div className="space-y-8">
          <Reveal as="section" aria-labelledby="channels-title">
            <h2 id="channels-title" className="text-lg font-black text-ink">
              راه‌های ارتباطی
            </h2>
            <Stagger as="ul" step={100} className="mt-4 space-y-4">
              <li>
                <a
                  href={bale}
                  {...NEW_TAB}
                  className={`group block rounded-card border-2 border-brand/60 bg-brand-soft p-5 shadow-card hover:border-brand-strong ${cardLift}`}
                >
                  <span className="flex items-center gap-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-ink">
                      <BaleIcon className="size-7" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-ink">ربات لرناموز در بله</span>
                        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-brand-strong">
                          راه اصلی و پیشنهادی
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-2">پشتیبانی، ثبت‌نام، کلاس‌ها و پیگیری پیام‌ها</span>
                      <span dir="ltr" className="mt-1 block truncate text-end font-semibold text-brand-strong">
                        {baleHandle}
                      </span>
                    </span>
                  </span>
                  <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-ink transition-colors group-hover:bg-brand-strong group-hover:text-white sm:text-base">
                    گفتگو با ربات لرناموز در بله
                    <External className="size-4" />
                    <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={telegram}
                  {...NEW_TAB}
                  className={`group flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-card hover:border-brand ${cardLift}`}
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-brand-strong">
                    <Telegram className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">پشتیبانی در تلگرام</span>
                    <span className="block text-sm text-ink-3">اگر به بله دسترسی ندارید</span>
                    <span dir="ltr" className="mt-1 block truncate text-end font-semibold text-brand-strong">
                      {telegramHandle}
                    </span>
                  </span>
                  <External className="size-4 shrink-0 text-ink-3 group-hover:text-brand-strong" />
                  <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
                </a>
              </li>
            </Stagger>
          </Reveal>
        </div>

        <Reveal as="section" delay={120} aria-labelledby="support-title" className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
            <h2 id="support-title" className="text-lg font-black text-ink">
              پشتیبانی لرناموز چطور کار می‌کند؟
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-2">
              <li className="flex gap-3">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-brand-strong" />
                <span>
                  درگاه رسمی ارتباط با لرناموز، <strong className="text-ink">ربات لرناموز در پیام‌رسان بله</strong> است؛
                  اطلاعیه‌ها، لینک جلسه‌ها و پاسخ‌ها از همین راه به شما می‌رسد.
                </span>
              </li>
              <li className="flex gap-3">
                <BaleIcon className="mt-1 size-5 shrink-0 text-brand-strong" />
                <span>
                  پیشنهاد، درخواست یا شکایت‌تان را در بخش «☎️ پشتیبانی و گفتگوها» ثبت کنید؛ پاسخ‌ها در همان گفتگو می‌ماند و
                  قابل پیگیری است.
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-1 size-5 shrink-0 text-brand-strong" />
                <span>ربات شبانه‌روز در دسترس است و تیم پشتیبانی در اسرع وقت پاسخ می‌دهد.</span>
              </li>
            </ul>
        </Reveal>
      </div>

      <section aria-labelledby="topics-title" className="border-t border-line bg-surface-2/60">
        <div className={`${container} py-12 sm:py-16`}>
          <Reveal as="h2" id="topics-title" className="text-2xl font-black text-ink">
            دربارهٔ چه چیزی با ما در ارتباط باشید؟
          </Reveal>
          <Stagger as="ul" step={100} className="mt-6 grid gap-4 md:grid-cols-3">
            {topics.map((t) => (
              <li key={t.title} className="rounded-card border border-line bg-surface p-6 shadow-card">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                  <t.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-bold text-ink">{t.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-2">{t.body}</p>
              </li>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
