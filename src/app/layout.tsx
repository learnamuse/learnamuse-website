import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { site } from "@/lib/content";
import { SITE_ORIGIN, BASE_PATH, asset } from "@/lib/url";
import { ogBase } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { PageTransition } from "@/components/motion/PageTransition";
import "./globals.css";
import "./motion.css";

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
  openGraph: ogBase,
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next turns off the CSS smooth scrolling while it resets scroll on a
    // route change, so the view transition lands on the new page's top instead of gliding there.
    // Inline view-transition-name "root" (the UA default): React only applies its "root not
    // affected" shortcut (0×0 transition overlay) when this is empty, and in Chrome that shortcut
    // blanked the page for the length of the route transition. With it set, the normal capture path runs.
    <html
      lang="fa"
      dir="rtl"
      data-scroll-behavior="smooth"
      style={{ viewTransitionName: "root" }}
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-brand px-5 py-3 font-bold text-brand-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4 print:hidden"
        >
          پرش به محتوای اصلی
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <MotionRuntime />
      </body>
    </html>
  );
}
