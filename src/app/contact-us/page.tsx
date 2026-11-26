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
  "ارتباط با تیم لرناموز از راه پشتیبانی تلگرام، برای پرسش، پیشنهاد یا درخواست همکاری. اعضای ربات لرناموز در بله می‌توانند از بخش پشتیبانی ربات هم استفاده کنند.";

export const metadata: Metadata = {
  title: contact.title,
  description,
  alternates: { canonical: absoluteUrl("/contact-us/") },
  openGraph: { ...ogBase, url: absoluteUrl("/contact-us/"), title: `${contact.title} – ${site.name}`, description },
};

const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Who usually writes to us. Website visitors reach us on Telegram; the Bale bot's support
 * section is only open to people who are already members of the bot.
 */
const topics = [
  {
    icon: Users,
    title: "آموزندگان و خانواده‌ها",
    body: "پرسش‌تان دربارهٔ کلاس‌ها و ثبت‌نام را در تلگرام بفرستید. اگر عضو ربات لرناموز هستید، بخش «☎️ پشتیبانی و گفتگوها» در ربات هم در دسترس شماست.",
  },
  {
    icon: HandHeart,
    title: "آموزگاران",
    body: "اگر می‌خواهید با لرناموز همکاری آموزشی داشته باشید، در تلگرام به ما پیام بدهید و کمی از تجربه و زمینهٔ تدریس‌تان بگویید.",
  },
  {
    icon: School,
    title: "مدارس و آموزشگاه‌ها",
    body: "برای همکاری مدرسه‌ها و آموزشگاه‌ها و راه‌اندازی ربات و پنل اختصاصی، در تلگرام پیام بگذارید تا برای هماهنگی با شما در ارتباط باشیم.",
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
            {site.footer.cta} برای پرسش، پیشنهاد یا درخواست همکاری، در تلگرام به پشتیبانی لرناموز پیام بدهید.
          </p>
        }
      />

      <div className={`${container} grid items-start gap-8 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12`}>
        <Reveal as="section" aria-labelledby="channels-title">
          <h2 id="channels-title" className="text-lg font-black text-ink">
            راه ارتباط با ما
          </h2>
          <Stagger as="ul" step={100} className="mt-4 space-y-4">
            <li>
              <a
                href={telegram}
                {...NEW_TAB}
                className={`group block rounded-card border-2 border-brand/60 bg-brand-soft p-5 shadow-card hover:border-brand-strong ${cardLift}`}
              >
                <span className="flex items-center gap-4">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-ink">
                    <Telegram className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">پشتیبانی لرناموز در تلگرام</span>
                    <span className="mt-0.5 block text-sm text-ink-2">پرسش، پیشنهاد، درخواست همکاری و هماهنگی مدارس</span>
                    <span dir="ltr" className="mt-1 block truncate text-end font-semibold text-brand-strong">
                      {telegramHandle}
                    </span>
                  </span>
                </span>
                <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-ink transition-colors group-hover:bg-brand-strong group-hover:text-white sm:text-base">
                  پیام در تلگرام
                  <External className="size-4" />
                  <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={bale}
                {...NEW_TAB}
                className={`group flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-card hover:border-brand ${cardLift}`}
              >
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-brand-strong">
                  <BaleIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink">پشتیبانی داخل ربات بله</span>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-ink-2">ویژهٔ اعضای ربات</span>
                  </span>
                  <span className="block text-sm text-ink-3">
                    اگر در ربات لرناموز عضو هستید، از بخش «☎️ پشتیبانی و گفتگوها» پیام بدهید.
                  </span>
                  <span dir="ltr" className="mt-1 block truncate text-end font-semibold text-brand-strong">
                    {baleHandle}
                  </span>
                </span>
                <External className="size-4 shrink-0 text-ink-3 group-hover:text-brand-strong" />
                <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
              </a>
            </li>
          </Stagger>
        </Reveal>

        <Reveal
          as="section"
          delay={120}
          aria-labelledby="support-title"
          className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
        >
          <h2 id="support-title" className="text-lg font-black text-ink">
            پشتیبانی لرناموز چطور کار می‌کند؟
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-2">
            <li className="flex gap-3">
              <Telegram className="mt-1 size-5 shrink-0 text-brand-strong" />
              <span>
                بازدیدکنندگان وب‌سایت از راه <strong className="text-ink">پشتیبانی تلگرام</strong> با ما در ارتباط هستند؛ پیام
                بدهید تا پاسخ‌تان را همان‌جا بگیرید.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-1 size-5 shrink-0 text-brand-strong" />
              <span>
                اعضای ربات لرناموز در بله، پیشنهاد، درخواست یا شکایت‌شان را در بخش «☎️ پشتیبانی و گفتگوها» ثبت می‌کنند؛ پاسخ‌ها
                در همان گفتگو می‌ماند و قابل پیگیری است.
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-brand-strong" />
              <span>تیم پشتیبانی در اسرع وقت پاسخ می‌دهد.</span>
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
