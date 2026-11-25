import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import { container } from "@/components/ui/styles";
import { Diamond } from "@/components/ui/Diamond";
import { Mail, Telegram, ArrowForward, ShieldCheck } from "@/components/ui/icons";
import { getNavItems } from "./nav";

export function Footer() {
  const items = getNavItems();
  return (
    <footer className="mt-auto border-t border-line bg-surface-2/70 print:hidden">
      {/* CTA strip */}
      <div className={`${container} pt-12 sm:pt-16`}>
        <div className="relative overflow-hidden rounded-card bg-brand-ink px-6 ring-1 ring-white/10 py-8 text-white sm:px-10 sm:py-10">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-lg font-bold leading-9 sm:text-xl">{site.footer.cta}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={site.contact.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 font-bold text-brand-ink transition-colors hover:bg-white"
              >
                <Telegram className="size-5" />
                پیام در تلگرام
                <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
              </a>
              <Link
                href="/contact-us/"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 font-bold text-white transition-colors hover:bg-white/10"
              >
                فرم تماس
                <ArrowForward className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`${container} grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
        <div>
          <Link href="/" className="inline-flex items-center gap-3 rounded-lg" aria-label={`${site.name} — صفحهٔ اصلی`}>
            <Image src={site.logo.mark} alt="" width={256} height={256} sizes="44px" className="size-11 rounded-xl" />
            <span className="flex items-baseline gap-2 text-xl font-black text-ink">
              {site.name}
              <span className="text-sm font-semibold text-ink-3" lang="en" dir="ltr">
                {site.nameEn}
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs leading-8 text-ink-2">{site.tagline}</p>
        </div>

        <nav aria-label="پیوندهای پانویس">
          <h2 className="mb-4 text-sm font-bold text-ink">صفحه‌ها</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.route}>
                <Link href={i.route} className="text-ink-2 hover:text-brand-strong">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-bold text-ink">راه‌های ارتباطی</h2>
          <ul className="space-y-3">
            <li>
              <a
                href={site.contact.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ink-2 hover:text-brand-strong"
              >
                <Telegram className="size-4 shrink-0 text-brand-strong" />
                <span dir="ltr">{site.contact.telegramHandle}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-2 break-all text-ink-2 hover:text-brand-strong"
              >
                <Mail className="size-4 shrink-0 text-brand-strong" />
                <span dir="ltr">{site.contact.email}</span>
              </a>
            </li>
          </ul>
          {site.social.length > 0 && (
            <ul className="mt-5 flex gap-2" aria-label="شبکه‌های اجتماعی">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-brand hover:text-brand-strong"
                  >
                    {/telegram/i.test(s.label) ? <Telegram className="size-5" /> : <Diamond className="size-4" />}
                    <span className="sr-only">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold text-ink">گواهی‌ها</h2>
          <p className="leading-7 text-ink-2">اصالت گواهی‌های صادرشده توسط لرناموز را آنلاین بررسی کنید.</p>
          <Link
            href="/certificates/"
            className="mt-3 inline-flex items-center gap-2 font-bold text-brand-strong hover:underline underline-offset-4"
          >
            <ShieldCheck className="size-5" />
            استعلام گواهی
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className={`${container} flex flex-col items-center justify-between gap-2 py-6 text-sm text-ink-3 sm:flex-row`}>
          <p>{site.footer.copyright}</p>
          <p className="flex items-center gap-2">
            <Diamond className="size-3 text-brand" />
            <span lang="en" dir="ltr">
              {site.url.replace(/^https?:\/\//, "")}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
