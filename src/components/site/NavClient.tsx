"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Close, Menu, ArrowForward } from "@/components/ui/icons";
import { Diamond } from "@/components/ui/Diamond";
import type { NavItem } from "./nav";

function isActive(pathname: string, route: string) {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return route === "/" ? p === "/" : p.startsWith(route);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.route);
        return (
          <li key={item.route}>
            <Link
              href={item.route}
              aria-current={active ? "page" : undefined}
              className={`nav-link relative block rounded-full px-3.5 py-2 text-[0.95rem] font-semibold transition-colors duration-200 ${
                active ? "bg-brand-soft text-brand-strong" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes; focus moves into the panel on open.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-[background-color,scale] duration-200 hover:bg-surface-2 motion-safe:active:scale-95"
      >
        <span key={open ? "close" : "menu"} className={`inline-flex ${open ? "icon-swap" : ""}`}>
          {open ? <Close className="size-5" /> : <Menu className="size-5" />}
        </span>
        <span className="sr-only">{open ? "بستن منو" : "باز کردن منو"}</span>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        data-open={open}
        className="mobile-panel absolute inset-x-0 top-full border-b border-line bg-bg shadow-card"
      >
        <nav aria-label="منوی موبایل" className="mx-auto max-w-6xl px-4 pb-6 pt-3">
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const active = isActive(pathname, item.route);
              return (
                <li key={item.route}>
                  <Link
                    href={item.route}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-4 text-lg font-bold ${
                      active ? "text-brand-strong" : "text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Diamond className={`size-3.5 ${active ? "text-brand" : "text-line"}`} />
                      {item.label}
                    </span>
                    <ArrowForward className="size-4 text-ink-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/contact-us/"
            onClick={() => setOpen(false)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 font-bold text-brand-ink transition-[background-color,color,scale] duration-200 hover:bg-brand-strong hover:text-white motion-safe:active:scale-[0.98]"
          >
            همکاری با ما
            <ArrowForward className="size-4" />
          </Link>
        </nav>
      </div>
    </div>
  );
}
