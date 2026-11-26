"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { BotPage } from "@/lib/schemas";
import styles from "./bot.module.css";

type Chat = BotPage["chat"];
type Message = Chat["messages"][number];

/** Pauses (ms): how long the bot "types", how long before the user answers, and the rest before looping. */
const TYPING_MS = 1100;
const USER_MS = 1000;
const AFTER_BOT_MS = 650;
const HOLD_MS = 5200;

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
/** Show the whole conversation without animation: reduced motion, or no IntersectionObserver. */
const prefersStill = () => window.matchMedia(REDUCE).matches || !("IntersectionObserver" in window);

/**
 * A phone showing a short, looping Bale conversation with the bot.
 * It only plays while on screen. With reduced motion it shows the whole conversation at once.
 * The animated mock is aria-hidden; screen readers get the same messages as a plain list.
 */
export function ChatDemo({ chat, logo, className = "" }: { chat: Chat; logo: string; className?: string }) {
  const total = chat.messages.length;
  // Start with the greeting already on screen, so the phone is never empty (also without JS).
  const [shown, setShown] = useState(Math.min(2, total));
  const [typing, setTyping] = useState(false);
  const [fading, setFading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const still = useSyncExternalStore(subscribeReducedMotion, prefersStill, () => false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Play only while visible; reduced motion shows the finished conversation.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || still) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  useEffect(() => {
    if (!playing || still) return;
    let t: ReturnType<typeof setTimeout>;
    if (shown >= total) {
      t = setTimeout(() => {
        setFading(true);
        t = setTimeout(() => {
          setShown(0);
          setFading(false);
        }, 450);
      }, HOLD_MS);
    } else {
      const next = chat.messages[shown];
      const prev = chat.messages[shown - 1];
      if (next.from === "bot") {
        const lead = prev?.from === "bot" ? AFTER_BOT_MS : 300;
        t = setTimeout(() => {
          setTyping(true);
          t = setTimeout(() => {
            setTyping(false);
            setShown((n) => n + 1);
          }, TYPING_MS);
        }, lead);
      } else {
        t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 500 : USER_MS);
      }
    }
    return () => clearTimeout(t);
  }, [playing, still, shown, total, chat.messages]);

  const visible = still ? chat.messages : chat.messages.slice(0, shown);

  return (
    <figure ref={rootRef} className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-[2.6rem] border-[9px] border-[#1d2a17] bg-[#1d2a17] shadow-[0_30px_60px_-20px_rgb(31_61_10/0.45),0_10px_20px_-10px_rgb(20_24_15/0.25)]"
      >
        {/* notch */}
        <div className="absolute inset-x-0 top-1.5 z-20 mx-auto h-5 w-24 rounded-full bg-[#1d2a17]" />
        <div className="flex h-[29rem] flex-col overflow-hidden rounded-[2rem] bg-[#eef5e6] sm:h-[34rem]">
          {/* chat header */}
          <div className="relative z-10 flex items-center gap-3 border-b border-black/5 bg-white px-4 pb-3 pt-8">
            <Image src={logo} alt="" width={256} height={256} sizes="40px" className="size-10 rounded-xl" />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-black text-ink">{chat.title}</p>
              <p className="text-xs text-brand-strong">{typing ? "در حال نوشتن…" : chat.subtitle}</p>
            </div>
          </div>

          {/* messages */}
          <div className="relative flex-1 overflow-hidden">
            <div className="motif-lattice absolute inset-0 opacity-[0.12]" />
            <ol
              className={`${styles.chatFade} relative flex h-full flex-col justify-end gap-2 px-3 pb-4 pt-6 transition-opacity duration-500 ${
                fading ? "opacity-0" : "opacity-100"
              }`}
            >
              {visible.map((m, i) => (
                <li key={`${i}-${m.text}`} className={`${styles.msgRow} ${still ? "" : styles.msgNew}`}>
                  <Bubble m={m} />
                </li>
              ))}
              {typing && (
                <li className={`${styles.msgRow} ${styles.msgNew}`}>
                  <div className="flex justify-end">
                    <div className="flex items-center gap-1 rounded-2xl rounded-es-md bg-white px-3.5 py-3 shadow-sm">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className={`${styles.typingDot} size-1.5 rounded-full bg-brand-strong`} />
                      ))}
                    </div>
                  </div>
                </li>
              )}
            </ol>
          </div>

          {/* composer */}
          <div className="flex items-center gap-2 border-t border-black/5 bg-white px-3 py-2.5">
            <div className="h-9 flex-1 rounded-full bg-[#f1f4ec] px-4 text-xs leading-9 text-ink-3">پیام…</div>
            <div className="flex size-9 items-center justify-center rounded-full bg-brand text-brand-ink">
              <svg viewBox="0 0 24 24" className="size-4 -scale-x-100" fill="currentColor">
                <path d="M3.4 20.4l17.5-7.5a1 1 0 000-1.8L3.4 3.6a1 1 0 00-1.4 1.2L4 11l9 1-9 1-2 6.2a1 1 0 001.4 1.2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-sm text-ink-3">{chat.caption}</figcaption>

      {/* the same conversation for screen readers */}
      <ol className="sr-only">
        {chat.messages.map((m, i) => (
          <li key={i}>
            {m.from === "bot" ? "ربات: " : "شما: "}
            {m.text}
            {m.file ? ` (فایل: ${m.file})` : ""}
            {m.buttons?.length ? ` — دکمه‌ها: ${m.buttons.join("، ")}` : ""}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function Bubble({ m }: { m: Message }) {
  const mine = m.from === "user";
  return (
    // RTL: the user's own messages sit on the right (start), the bot's on the left (end).
    <div className={`flex ${mine ? "justify-start" : "justify-end"}`}>
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[0.8rem] leading-6 shadow-sm ${
            mine ? "rounded-ss-md bg-[#d9f2c4] text-[#183307]" : "rounded-es-md bg-white text-ink"
          }`}
        >
          {m.file && (
            <span className="mb-1.5 flex items-center gap-2 rounded-xl bg-white/70 px-2 py-1.5 text-[0.72rem] font-semibold text-brand-strong">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand text-[0.6rem] font-black text-brand-ink">
                PDF
              </span>
              <span className="truncate">{m.file}</span>
            </span>
          )}
          <span dir={m.text.startsWith("/") ? "ltr" : undefined} className={m.text.startsWith("/") ? "font-mono" : undefined}>
            {m.text}
          </span>
        </div>
        {m.buttons && (
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {m.buttons.map((b) => (
              <span
                key={b}
                className={`rounded-xl bg-white/85 px-2 py-1.5 text-center text-[0.7rem] font-bold text-brand-strong shadow-sm ring-1 ring-brand/25 ${
                  m.buttons!.length === 1 ? "col-span-2" : ""
                }`}
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
