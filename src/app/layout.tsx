import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { site } from "@/lib/content";
import { SITE_ORIGIN, BASE_PATH, asset } from "@/lib/url";
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

// Header/Footer are rendered here by the frontend (see src/components/site/*).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
