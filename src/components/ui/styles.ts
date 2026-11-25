/** Shared class recipes so buttons/links look identical everywhere. */
export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold leading-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base";

export const btnPrimary = `${btnBase} bg-brand text-brand-ink hover:bg-brand-strong hover:text-white dark:hover:text-brand-ink`;
export const btnSecondary = `${btnBase} border border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft`;
export const btnGhost = `${btnBase} text-ink-2 hover:bg-surface-2 hover:text-ink`;

export const eyebrow =
  "inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong sm:text-sm";

export const linkInline =
  "font-semibold text-brand-strong underline decoration-brand/40 decoration-2 underline-offset-4 hover:decoration-brand";
