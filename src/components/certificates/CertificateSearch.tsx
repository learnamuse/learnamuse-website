"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, ArrowForward, ShieldCheck, Close } from "@/components/ui/icons";
import { Diamond } from "@/components/ui/Diamond";

export type SearchEntry = {
  route: string;
  nameFa: string;
  nameEn: string;
  salutation: string | null;
  courseTitle: string;
  issuedOnFa: string;
};

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const faDigits = (s: string) => s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);

/**
 * Fold the many ways a Persian/English name can be typed into one comparable form:
 * Arabic ي/ى/ك → Persian ی/ک, hamza/madda variants → ا, ة → ه, strip diacritics, tatweel,
 * ZWNJ/ZWJ/bidi marks, punctuation and all whitespace; lowercase Latin.
 */
export function normalizeName(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ی")
    .replace(/ة/g, "ه")
    .replace(/[ً-ٰٟـ]/g, "") // harakat, superscript alef, tatweel
    .replace(/[​-‏‪-‮⁦-⁩﻿]/g, "") // ZW*, bidi controls
    .replace(/[\s\-_.'’"،,]+/g, "");
}

export function CertificateSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  // Pick up ?q= from the home-page form (static export: read it on the client).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    if (q) setQuery(q);
  }, []);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (deferred.trim()) url.searchParams.set("q", deferred.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url);
  }, [deferred]);

  const indexed = useMemo(
    () => entries.map((e) => ({ e, keys: [normalizeName(e.nameFa), normalizeName(e.nameEn)] })),
    [entries],
  );

  const q = normalizeName(deferred);
  const results = q.length === 0 ? [] : indexed.filter(({ keys }) => keys.some((k) => k.includes(q))).map((x) => x.e);
  const hasQuery = deferred.trim().length > 0;

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="cert-q" className="mb-3 block text-base font-bold text-ink">
          نام دارندهٔ گواهی را بنویسید
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-card transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/40 sm:rounded-full">
          <Search className="ms-3 size-6 shrink-0 text-ink-3" />
          <input
            id="cert-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="مثلاً «رحیمی» یا «Rahimi»"
            aria-describedby="cert-q-hint"
            aria-controls="cert-results"
            className="min-w-0 flex-1 bg-transparent py-3 text-lg text-ink outline-none placeholder:text-base placeholder:text-ink-3 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <Close className="size-5" />
              <span className="sr-only">پاک کردن جست‌وجو</span>
            </button>
          )}
        </div>
        <p id="cert-q-hint" className="mt-3 text-sm text-ink-3">
          جست‌وجو روی همین صفحه انجام می‌شود و به نوشتن «ي/ی»، «ك/ک» یا نیم‌فاصله حساس نیست.
        </p>
      </form>

      <div id="cert-results" className="mt-8">
        <p aria-live="polite" className="text-sm font-semibold text-ink-2">
          {hasQuery
            ? results.length > 0
              ? `${faDigits(String(results.length))} گواهی پیدا شد`
              : "گواهی‌ای با این نام پیدا نشد."
            : ""}
        </p>

        {hasQuery && results.length === 0 && (
          <div className="mt-4 rounded-card border border-dashed border-line bg-surface-2/60 p-6 text-center leading-8 text-ink-2">
            املای نام را بررسی کنید یا فقط نام خانوادگی را بنویسید. اگر مطمئنید گواهی‌تان باید اینجا باشد، از صفحهٔ{" "}
            <Link href="/contact-us/" className="font-bold text-brand-strong underline underline-offset-4">
              ارتباط با ما
            </Link>{" "}
            خبرمان کنید.
          </div>
        )}

        {results.length > 0 && (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {results.map((r, i) => (
              <li key={r.route} className="motion-fade-in" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
                <Link
                  href={r.route}
                  className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card transition-[translate,box-shadow,border-color] duration-300 ease-out hover:border-brand hover:shadow-lift motion-safe:hover:-translate-y-0.5 sm:p-5"
                >
                  <span className="relative inline-flex size-12 shrink-0 items-center justify-center text-gold">
                    <Diamond className="absolute inset-0 size-12 opacity-30" />
                    <ShieldCheck className="relative size-6 text-ink" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-black text-ink">
                      {r.salutation && <span className="me-1 text-sm font-semibold text-ink-3">{r.salutation}</span>}
                      {r.nameFa}
                    </span>
                    <span lang="en" dir="ltr" className="block truncate text-end text-sm text-ink-3">
                      {r.nameEn}
                    </span>
                    <span className="mt-1 block truncate text-sm text-ink-2">
                      {r.courseTitle} · {faDigits(r.issuedOnFa)}
                    </span>
                  </span>
                  <ArrowForward className="size-5 shrink-0 text-ink-3 transition-transform group-hover:-translate-x-1 group-hover:text-brand-strong" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
