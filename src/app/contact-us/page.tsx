import type { Metadata } from "next";
import { pages, site } from "@/lib/content";
import { absoluteUrl } from "@/lib/url";
import { PageHeader } from "@/components/ui/PageHeader";
import { container } from "@/components/ui/styles";
import { Telegram, Mail, External } from "@/components/ui/icons";
import { ContactForm } from "@/components/contact/ContactForm";

const contact = pages.contact;
const description = "پیام، پیشنهاد یا درخواست همکاری‌تان را برای تیم لرناموز بفرستید.";

export const metadata: Metadata = {
  title: contact.title,
  description,
  alternates: { canonical: absoluteUrl("/contact-us/") },
  openGraph: { url: absoluteUrl("/contact-us/"), title: `${contact.title} – ${site.name}`, description },
};

export default function ContactPage() {
  const channels = [
    {
      icon: Telegram,
      title: "تلگرام",
      hint: "سریع‌ترین راه گفتگو با ما",
      value: site.contact.telegramHandle,
      href: site.contact.telegram,
      external: true,
    },
    {
      icon: Mail,
      title: "ایمیل",
      hint: "برای مکاتبات رسمی",
      value: site.contact.email,
      href: `mailto:${site.contact.email}`,
      external: false,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="خوشحال می‌شیم از شما بشنویم"
        title={contact.title}
        lead={<p>{site.footer.cta} فرم زیر را پر کنید یا از یکی از راه‌های ارتباطی مستقیم استفاده کنید.</p>}
      />

      <div className={`${container} grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12`}>
        <aside aria-labelledby="channels-title" className="lg:order-none">
          <h2 id="channels-title" className="text-lg font-black text-ink">
            راه‌های ارتباطی
          </h2>
          <ul className="mt-4 space-y-4">
            {channels.map((c) => (
              <li key={c.title}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition-colors hover:border-brand"
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                    <c.icon className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">{c.title}</span>
                    <span className="block text-sm text-ink-3">{c.hint}</span>
                    <span dir="ltr" className="mt-1 block truncate text-end font-semibold text-brand-strong">
                      {c.value}
                    </span>
                  </span>
                  {c.external && (
                    <>
                      <External className="size-4 shrink-0 text-ink-3 group-hover:text-brand-strong" />
                      <span className="sr-only">(در پنجرهٔ جدید باز می‌شود)</span>
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <section aria-labelledby="form-title" className="rounded-[2rem] border border-line bg-surface p-6 shadow-card sm:p-10">
          <h2 id="form-title" className="text-2xl font-black text-ink">
            ارسال پیام
          </h2>
          <p className="mb-6 mt-2 leading-7 text-ink-2">پیام شما مستقیم به دست تیم لرناموز می‌رسد.</p>
          <ContactForm
            fields={contact.form.fields}
            submitLabel={contact.form.submitLabel}
            telegram={site.contact.telegram}
            telegramHandle={site.contact.telegramHandle}
            email={site.contact.email}
          />
        </section>
      </div>
    </>
  );
}
