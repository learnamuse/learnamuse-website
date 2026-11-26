"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
/** An element counts as "already on screen" if its top is above this fraction of the viewport. */
const FOLD = 0.94;
/** How long a reveal takes before its inline motion state is cleared (delay is added). */
const SETTLE_MS = 950;

/**
 * Drives [data-reveal] / [data-stagger] from <Reveal/> and <Stagger/> (see Reveal.tsx), once
 * per route. One IntersectionObserver for the whole page; nothing runs per scroll frame.
 * Also keeps the header's "scrolled" state for browsers without scroll-driven animations.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia(REDUCE).matches) return;

    const vh = window.innerHeight;
    const groupOf = new Map<HTMLElement, HTMLElement>();
    const candidates: HTMLElement[] = [];

    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      for (const child of Array.from(group.children) as HTMLElement[]) {
        if (!child.dataset.reveal) child.dataset.reveal = group.dataset.staggerVariant || "up";
        groupOf.set(child, group);
      }
    });
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.motion) return; // already handled
      // Only hide what starts below the fold; anything on (or above) screen stays put.
      if (el.getBoundingClientRect().top < vh * FOLD) return;
      candidates.push(el);
    });
    if (candidates.length === 0) return;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const io = new IntersectionObserver(
      (entries) => {
        const batchIndex = new Map<HTMLElement, number>();
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);

          let delay = Number(el.dataset.revealDelay) || 0;
          const group = groupOf.get(el);
          if (group) {
            const i = batchIndex.get(group) ?? 0;
            batchIndex.set(group, i + 1);
            const step = Number(group.dataset.stagger) || 70;
            const max = Number(group.dataset.staggerMax) || 6;
            delay += Math.min(i, max) * step;
          }
          el.style.setProperty("--reveal-delay", `${delay}ms`);
          el.dataset.motion = "in";
          const t = setTimeout(() => {
            el.dataset.motion = "done"; // hand transitions back to the element's own classes
            el.style.removeProperty("--reveal-delay");
            timers.delete(t);
          }, delay + SETTLE_MS);
          timers.add(t);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    for (const el of candidates) {
      el.dataset.motion = "out";
      io.observe(el);
    }

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      // Anything still hidden (e.g. route left mid-scroll) must never stay invisible.
      for (const el of candidates) if (el.dataset.motion === "out") el.dataset.motion = "done";
    };
  }, [pathname]);

  // Header shadow fallback: only where CSS scroll-driven animations are unavailable (or reduced motion).
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    const scrollDriven = CSS.supports?.("animation-timeline: scroll()") && !window.matchMedia(REDUCE).matches;
    if (scrollDriven) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolled = window.scrollY > 8 ? "true" : "false";
      if (header.dataset.scrolled !== scrolled) header.dataset.scrolled = scrolled;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
