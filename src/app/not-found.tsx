import type { Metadata } from "next";
import Link from "next/link";
import { container, btnPrimary, btnSecondary } from "@/components/ui/styles";
import { Diamond } from "@/components/ui/Diamond";
import { ArrowForward, ShieldCheck } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  // Next.js already emits <meta name="robots" content="noindex"> for the not-found page.
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="motif-lattice absolute inset-0 opacity-25" aria-hidden="true" />
      <div className={`${container} relative flex flex-col items-center py-20 text-center sm:py-28`}>
        <div className="relative flex size-36 items-center justify-center" aria-hidden="true">
          <Diamond className="absolute inset-0 size-full rotate-12 text-brand opacity-20" />
          <span className="relative text-5xl font-black text-brand-strong">۴۰۴</span>
        </div>
        <h1 className="mt-8 text-3xl font-black text-ink sm:text-4xl">این صفحه پیدا نشد</h1>
        <p className="mt-4 max-w-md leading-8 text-ink-2">
          شاید نشانی اشتباه تایپ شده یا صفحه جابه‌جا شده باشد. اگر دنبال یک گواهی هستید، از بخش استعلام کمک بگیرید.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={btnPrimary}>
            رفتن به صفحهٔ اصلی
            <ArrowForward className="size-4" />
          </Link>
          <Link href="/certificates/" className={btnSecondary}>
            <ShieldCheck className="size-5 text-brand-strong" />
            استعلام گواهی
          </Link>
        </div>
      </div>
    </section>
  );
}
