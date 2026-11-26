import Image from "next/image";
import type { CertificateWithCourse } from "@/lib/content";
import { site } from "@/lib/content";
import { Diamond } from "@/components/ui/Diamond";
import { faDigits } from "@/components/ui/format";

/**
 * The certificate "sheet". Below a 42rem container it's a normal stacked card; from 42rem up
 * (and in print, where it is 297mm wide) it locks to A4-landscape proportions and every size is
 * in container-query units (cqw), so it scales like a real piece of paper.
 */
export function CertificateDocument({
  cert,
  verifyUrl,
  qrSvg,
}: {
  cert: CertificateWithCourse;
  verifyUrl: string;
  qrSvg: string;
}) {
  const course = cert.courseData;
  const prettyUrl = verifyUrl.replace(/^https?:\/\//, "");

  return (
    <div className="@container">
      <article
        aria-label={`گواهی ${cert.nameFa}`}
        className="print-area cert-paper relative mx-auto overflow-hidden rounded-card border border-line p-3 shadow-card @2xl:aspect-[297/210] @2xl:p-[1.6cqw]"
      >
        {/* corner ornaments */}
        <Diamond className="pointer-events-none absolute -start-[6%] -top-[9%] hidden size-[22%] text-brand opacity-[0.12] @2xl:block" />
        <Diamond className="pointer-events-none absolute -bottom-[10%] -end-[5%] hidden size-[20%] text-secondary opacity-[0.16] @2xl:block" />

        <div className="relative flex h-full flex-col rounded-[1rem] border-2 border-brand/70 px-5 py-6 @2xl:rounded-[1.4cqw] @2xl:px-[4cqw] @2xl:py-[2.6cqw]">
          {/* inner hairline */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-[0.7rem] border border-brand/25 @2xl:inset-[0.6cqw] @2xl:rounded-[1cqw]"
          />
          {["-top-2 -start-2", "-top-2 -end-2", "-bottom-2 -start-2", "-bottom-2 -end-2"].map((pos) => (
            <Diamond
              key={pos}
              className={`absolute ${pos} size-4 text-brand @2xl:size-[1.8cqw]`}
            />
          ))}

          {/* header */}
          <header className="relative flex items-center justify-between gap-4">
            <Image
              src={site.logo.full}
              alt={`${site.name} | ${site.nameEn}`}
              width={1573}
              height={655}
              sizes="(min-width: 768px) 160px, 110px"
              className="h-9 w-auto @2xl:h-[4.4cqw]"
            />
            <p className="text-end text-[0.65rem] leading-5 text-ink-3 @2xl:text-[0.95cqw] @2xl:leading-[1.6cqw]">
              <span className="block">شناسهٔ گواهی</span>
              <span lang="en" dir="ltr" className="block font-mono font-semibold text-ink-2">
                {cert.course}/{cert.slug}
              </span>
            </p>
          </header>

          {/* body */}
          <div className="relative flex flex-1 flex-col items-center justify-center py-6 text-center @2xl:py-0">
            <h2 className="text-2xl font-black text-ink @2xl:text-[4cqw] @2xl:leading-[1.25]">گواهی پایان دوره</h2>
            <p
              lang="en"
              dir="ltr"
              className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-ink-3 @2xl:mt-[0.4cqw] @2xl:text-[1.05cqw]"
            >
              Certificate of Completion
            </p>

            <p className="mt-5 text-sm text-ink-2 @2xl:mt-[2.4cqw] @2xl:text-[1.6cqw]">بدین‌وسیله گواهی می‌شود که</p>
            <p className="mt-2 text-3xl font-black leading-tight text-ink @2xl:mt-[0.8cqw] @2xl:text-[5.4cqw]">
              {cert.salutation && (
                <span className="me-2 align-middle text-base font-bold text-ink-2 @2xl:me-[0.8cqw] @2xl:text-[1.8cqw]">
                  {cert.salutation}
                </span>
              )}
              {cert.nameFa}
            </p>
            <p lang="en" dir="ltr" className="mt-1 text-sm font-semibold text-ink-3 @2xl:mt-[0.5cqw] @2xl:text-[1.5cqw]">
              {cert.nameEn}
            </p>

            <div className="my-4 flex items-center gap-3 text-secondary @2xl:my-[1.8cqw] @2xl:gap-[1cqw]" aria-hidden="true">
              <span className="h-px w-16 bg-linear-to-l from-transparent to-current @2xl:w-[10cqw]" />
              <Diamond className="size-3.5 @2xl:size-[1.4cqw]" />
              <span className="h-px w-16 bg-linear-to-r from-transparent to-current @2xl:w-[10cqw]" />
            </div>

            <p className="max-w-[44ch] text-sm leading-7 text-ink-2 @2xl:max-w-[72%] @2xl:text-[1.7cqw] @2xl:leading-[2.9cqw]">
              <strong className="font-black text-ink">«{course.titleFa}»</strong> را که {course.partnerLabel} برگزار شد، به
              مدت {faDigits(course.durationFa)} با موفقیت گذرانده‌اند.
            </p>
            <p className="mt-3 max-w-[52ch] text-[0.7rem] leading-6 text-ink-3 @2xl:mt-[1cqw] @2xl:max-w-[78%] @2xl:text-[1.15cqw] @2xl:leading-[2cqw]">
              ابزارهای آموزش‌داده‌شده:{" "}
              {course.tools.map((t, i) => (
                <span key={t.name}>
                  <bdi lang="en">{t.name}</bdi>
                  {i < course.tools.length - 1 ? "، " : ""}
                </span>
              ))}
            </p>
          </div>

          {/* footer */}
          <footer className="relative grid grid-cols-2 items-end gap-4 border-t border-line pt-4 @2xl:grid-cols-[1fr_auto_1fr] @2xl:gap-[2cqw] @2xl:border-0 @2xl:pt-0">
            <dl className="col-span-2 grid grid-cols-2 gap-2 text-xs @2xl:col-span-1 @2xl:block @2xl:space-y-[0.8cqw] @2xl:text-[1.15cqw]">
              <div>
                <dt className="text-ink-3">تاریخ صدور</dt>
                <dd className="font-black text-ink">{faDigits(cert.issuedOnFa)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">مدت آموزش</dt>
                <dd className="font-black text-ink">{faDigits(course.durationFa)}</dd>
              </div>
            </dl>

            <div className="order-first col-span-2 flex justify-center @2xl:order-none @2xl:col-span-1">
              <Image
                src={course.badge}
                alt="نشان طلایی گواهی"
                width={250}
                height={250}
                sizes="(min-width: 768px) 112px, 80px"
                className="motion-pop-in size-20 drop-shadow-md [--enter-base:700ms] @2xl:size-[8.5cqw]"
              />
            </div>

            <div className="col-span-2 flex items-end justify-between gap-3 border-t border-line pt-4 @2xl:col-span-1 @2xl:justify-end @2xl:gap-[1cqw] @2xl:border-0 @2xl:pt-0">
              <div className="min-w-0 text-start text-[0.65rem] leading-5 text-ink-3 @2xl:text-end @2xl:text-[0.95cqw] @2xl:leading-[1.5cqw]">
                <p className="font-bold text-ink-2">اعتبارسنجی گواهی</p>
                <p lang="en" dir="ltr" className="break-all font-mono">
                  {prettyUrl}
                </p>
              </div>
              <div
                className="motion-pop-in size-16 shrink-0 rounded-md bg-white p-1 ring-1 ring-line [--enter-base:850ms] @2xl:size-[7.5cqw] @2xl:rounded-[0.5cqw] @2xl:p-[0.5cqw] [&>svg]:size-full"
                role="img"
                aria-label={`کد QR نشانی اعتبارسنجی: ${verifyUrl}`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
