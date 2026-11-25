import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { site } from "@/lib/content";
import { SITE_ORIGIN, BASE_PATH, asset } from "@/lib/url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_ORIGIN}${BASE_PATH}/`),
  title: { default: `${site.name} | ${site.nameEn} – ${site.tagline}`, template: `%s – ${site.name} | ${site.nameEn}` },
  description: site.tagline,
  icons: { icon: asset(site.logo.mark), apple: asset(site.logo.mark) },
  openGraph: { siteName: `${site.name} | ${site.nameEn}`, locale: "fa_IR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e110b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-brand px-5 py-3 font-bold text-brand-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4 print:hidden"
        >
          پرش به محتوای اصلی
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
