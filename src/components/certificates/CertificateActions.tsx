"use client";

import { useEffect, useRef, useState } from "react";
import { Printer, LinkIcon, Share, Check } from "@/components/ui/icons";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand hover:bg-brand-soft";

export function CertificateActions({ url, title, text }: { url: string; title: string; text: string }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (m: string) => {
    setMessage(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 3000);
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      flash("پیوند گواهی کپی شد.");
    } catch {
      // Fallback for insecure contexts / old browsers.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      flash(ok ? "پیوند گواهی کپی شد." : "کپی نشد؛ لطفاً نشانی را از نوار مرورگر بردارید.");
    }
  }

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    await copy();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => window.print()} className={btn}>
        <Printer className="size-5 text-brand-strong" />
        چاپ یا PDF
      </button>
      <button type="button" onClick={copy} className={btn}>
        <LinkIcon className="size-5 text-brand-strong" />
        کپی پیوند
      </button>
      <button type="button" onClick={share} className={btn}>
        <Share className="size-5 text-brand-strong" />
        اشتراک‌گذاری
      </button>
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-semibold text-brand-strong">
        {message && (
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-4" />
            {message}
          </span>
        )}
      </p>
    </div>
  );
}
