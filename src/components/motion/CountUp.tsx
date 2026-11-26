"use client";

import { useEffect, useRef } from "react";
import { faNumber } from "@/components/ui/format";

const DURATION = 1300;

/**
 * A number that counts up (Persian digits) the first time it scrolls into view.
 * The HTML always holds the final value: without JS, with reduced motion, or when it is
 * already on screen at load, nothing animates. Assistive tech only ever reads the final
 * number (the animated copy is aria-hidden). An invisible copy reserves the final width and the animated copy fills the same grid cell, so its box never moves (CLS 0).
 */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = faNumber(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0 || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.94) return;

    let frame = 0;
    el.textContent = faNumber(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now() + 150;
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - start) / DURATION));
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = faNumber(Math.round(eased * value));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = faNumber(value);
    };
  }, [value]);

  return (
    <span className={`grid text-center tabular-nums ${className}`}>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {final}
      </span>
      <span ref={ref} aria-hidden="true" className="col-start-1 row-start-1">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
