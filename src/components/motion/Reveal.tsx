import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Scroll-reveal primitives. These are plain server components: they only add data attributes.
 * The single client-side runtime (<MotionRuntime/> in the root layout) does the rest:
 *
 * - The HTML always renders fully visible (no JS, reduced motion, print, old browsers).
 * - After hydration, only elements that start *below the fold* are put in the hidden "out"
 *   state, so nothing already on screen ever flashes away.
 * - Each element fades and rises in once, the first time it scrolls into view.
 *
 * Variants: "up" (default), "start"/"end" (slide in from that inline side, RTL-aware, on
 * md+ screens; plain rise on phones), "pop" (small scale-up), "fade".
 */
export type RevealVariant = "up" | "start" | "end" | "pop" | "fade";

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function Reveal<T extends ElementType = "div">({
  as,
  variant = "up",
  delay,
  children,
  ...rest
}: PolymorphicProps<T> & {
  variant?: RevealVariant;
  /** Extra delay in ms once the element is in view. */
  delay?: number;
}) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag data-reveal={variant} data-reveal-delay={delay || undefined} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A container whose direct children reveal one after another. Children are observed
 * individually and cascade within each batch that enters the viewport together, so long
 * grids reveal row by row and the total delay is capped (never more than `max` steps).
 */
export function Stagger<T extends ElementType = "div">({
  as,
  variant = "up",
  step = 70,
  max = 6,
  children,
  ...rest
}: PolymorphicProps<T> & {
  variant?: RevealVariant;
  /** Delay between consecutive children, ms. */
  step?: number;
  /** Cap on the number of steps in one batch. */
  max?: number;
}) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag data-stagger={step} data-stagger-max={max} data-stagger-variant={variant} {...rest}>
      {children}
    </Tag>
  );
}
