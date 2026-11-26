"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { BotPage } from "@/lib/schemas";
import styles from "./bot.module.css";

type Role = BotPage["roles"]["items"][number];

const ICONS: Record<string, ReactNode> = {
  learner: <path d="M3 9.5L12 5l9 4.5-9 4.5zM7 11.5V16c1.5 1.5 3.2 2.2 5 2.2s3.5-.7 5-2.2v-4.5M21 9.5V15" />,
  teacher: <path d="M4 5h16v10H4zM8 19h8M12 15v4M7.5 9.5h5M7.5 12h8" />,
  supervisor: <path d="M12 3l7 3v5.5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V6l7-3zM8.8 12.2l2.2 2.2 4.4-4.6" />,
  accountant: (
    <path d="M4 7.5A2.5 2.5 0 016.5 5H18v3M4 7.5V17a2 2 0 002 2h14v-5M4 7.5A1.5 1.5 0 005.5 9H20v5m0 0h-3.5a1.5 1.5 0 010-3H20" />
  ),
  admin: (
    <path d="M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" />
  ),
};

function RoleIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[id] ?? ICONS.learner}
    </svg>
  );
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation). Arrow keys follow the
 * reading direction: in RTL, ArrowLeft moves to the next tab. Inactive panels stay in the
 * HTML (hidden), so all copy is indexable and works without JS.
 */
export function RoleTabs({ roles }: { roles: Role[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const nextKey = rtl ? "ArrowLeft" : "ArrowRight";
    const prevKey = rtl ? "ArrowRight" : "ArrowLeft";
    let i = active;
    if (e.key === nextKey) i = (active + 1) % roles.length;
    else if (e.key === prevKey) i = (active - 1 + roles.length) % roles.length;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = roles.length - 1;
    else return;
    e.preventDefault();
    setActive(i);
    tabs.current[i]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="نقش‌ها در ربات لرناموز"
        onKeyDown={onKeyDown}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
      >
        {roles.map((r, i) => {
          const selected = i === active;
          return (
            <button
              key={r.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${r.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${r.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors duration-200 sm:text-base ${
                selected
                  ? "border-brand bg-brand text-brand-ink shadow-card"
                  : "border-line bg-surface text-ink-2 hover:border-brand hover:bg-brand-soft hover:text-ink"
              }`}
            >
              <RoleIcon id={r.id} className="size-5" />
              {r.label}
            </button>
          );
        })}
      </div>

      {roles.map((r, i) => (
        <div
          key={r.id}
          role="tabpanel"
          id={`${base}-panel-${r.id}`}
          aria-labelledby={`${base}-tab-${r.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="mt-8 rounded-[2rem] outline-offset-4"
        >
          <div className={i === active ? styles.panelIn : undefined}>
            <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                <RoleIcon id={r.id} className="size-7" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-ink sm:text-2xl">
                  {r.label}
                  <span className="ms-2 align-middle text-sm font-semibold text-ink-3">({r.audience})</span>
                </h3>
                <p className="mt-1 leading-7 text-ink-2">{r.summary}</p>
              </div>
            </div>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {r.features.map((f) => (
                <li
                  key={f.button}
                  className="rounded-card border border-line bg-surface p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-card"
                >
                  {/* styled like a Bale inline button: the real label people tap in the bot */}
                  <p className="inline-flex max-w-full rounded-xl bg-brand-soft px-3 py-1.5 text-sm font-bold leading-6 text-brand-strong ring-1 ring-brand/20">
                    {f.button}
                  </p>
                  <p className="mt-3 leading-7 text-ink-2">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
