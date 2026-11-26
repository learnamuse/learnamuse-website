"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./bot.module.css";

/**
 * Fades its children up the first time they scroll into view.
 * Content is visible by default (no JS, reduced motion, or already on screen): only blocks
 * that start below the fold are hidden, and only once this effect has run.
 */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.reveal = "out";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <div ref={ref} className={`${styles.reveal} ${className}`} style={style}>
      {children}
    </div>
  );
}
