import type { ReactNode } from "react";
import { container } from "./styles";
import { Diamond } from "./Diamond";

/** Top-of-page intro band shared by inner pages. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-surface-2/60">
      <div className="motif-lattice absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <Diamond className="pointer-events-none absolute -end-10 -top-12 size-56 text-brand opacity-[0.07]" />
      <div className={`${container} relative py-12 sm:py-16`}>
        {children}
        {eyebrow && (
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-strong">
            <Diamond className="size-3.5 text-brand" />
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {lead && <div className="mt-5 max-w-2xl text-base leading-8 text-ink-2 sm:text-lg sm:leading-9">{lead}</div>}
      </div>
    </header>
  );
}
