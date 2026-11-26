/**
 * The Learnamuse motif: the logo's rounded diamond with a dot punched through it.
 * Inherits colour from `currentColor`, so `text-brand` / `text-secondary` etc. just work.
 */
export function Diamond({ className = "size-4", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        fillRule="evenodd"
        d="M10.44 3.56Q12 2 13.56 3.56L20.44 10.44Q22 12 20.44 13.56L13.56 20.44Q12 22 10.44 20.44L3.56 13.56Q2 12 3.56 10.44ZM15 12A3 3 0 1 1 9 12A3 3 0 1 1 15 12Z"
      />
    </svg>
  );
}

/** Small centred ornament: line — diamond — line. Used to separate sections. */
export function DiamondRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-brand ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-linear-to-l from-transparent to-current opacity-60" />
      <Diamond className="size-3.5" />
      <span className="h-px w-12 bg-linear-to-r from-transparent to-current opacity-60" />
    </div>
  );
}
