import { faNumber } from "./format";

export type NumberBadgeSize = "sm" | "md" | "lg";
export type NumberBadgeVariant = "brand" | "soft" | "gold" | "outline";

/**
 * Numbered marker for steps, features and values.
 *
 * The logo's rounded diamond becomes a solid tile (a rounded square turned 45°) with the
 * Persian numeral standing upright on a clean surface, plus a thin inner outline that echoes
 * the lattice motif. Pure CSS (see `.num-badge` in globals.css), so it stays sharp at any
 * zoom. Sizes: sm 32px, md 44px, lg 56px.
 *
 * Contrast of the numeral on its tile (WCAG):
 *   brand   #1f3d0a on #7fd141 ≈ 6.4:1 (7.2:1 under the highlight)
 *   soft    #407c17 on #eef8e4 ≈ 4.7:1
 *   gold    #14180f on #f2b544 ≈ 9.8:1
 *   outline #407c17 on #ffffff ≈ 5.1:1
 *
 * Accessibility: by default the whole badge is hidden from assistive tech (the surrounding
 * `<ol>` already conveys order). Pass `label` (e.g. "گام ۳") when the number adds meaning
 * that the context does not already give; it is then exposed as visually hidden text.
 */
export function NumberBadge({
  value,
  size = "md",
  variant = "brand",
  label,
  className = "",
}: {
  value: number;
  size?: NumberBadgeSize;
  variant?: NumberBadgeVariant;
  /** Accessible text read instead of the bare numeral. Omit to hide the badge from AT. */
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`num-badge ${className}`}
      data-size={size}
      data-variant={variant}
      aria-hidden={label ? undefined : true}
    >
      <span className="num-badge-tile" aria-hidden="true" />
      <span className="num-badge-digit" aria-hidden={label ? true : undefined}>
        {faNumber(value)}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
