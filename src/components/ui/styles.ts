/** Shared class recipes so buttons/links look identical everywhere. */
export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** Hover: a 2px lift; press: a slight squeeze. Movement is skipped under reduced motion. */
const press =
  "transition-[color,background-color,border-color,box-shadow,translate,scale] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]";

const btnBase = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold leading-none ${press} disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0 sm:text-base`;

export const btnPrimary = `${btnBase} bg-brand text-brand-ink hover:bg-brand-strong hover:text-white hover:shadow-lift-brand`;
export const btnSecondary = `${btnBase} border border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft hover:shadow-card`;
export const btnGhost = `${btnBase} text-ink-2 hover:bg-surface-2 hover:text-ink`;

export const eyebrow =
  "inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong sm:text-sm";

export const linkInline =
  "font-semibold text-brand-strong underline decoration-brand/40 decoration-2 underline-offset-4 hover:decoration-brand";

/** Small pill/button press feedback for one-off buttons that don't use btnPrimary/btnSecondary. */
export const pressable = press;

/** Interactive card (whole card is a link): lift + deeper shadow on hover. */
export const cardLift =
  "transition-[translate,box-shadow,border-color] duration-300 ease-out hover:shadow-lift motion-safe:hover:-translate-y-1";
