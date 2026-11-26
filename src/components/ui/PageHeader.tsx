import type { ReactNode } from "react";
import Image from "next/image";
import { container } from "./styles";
import { Diamond } from "./Diamond";

/**
 * Optional full-bleed photo behind the header. The photos are the old site's bright
 * "white desk" shots; a white scrim on the text side (the start/right edge in RTL)
 * keeps the title readable, so pick a photo whose subject sits on the left.
 */
export type PageHeaderImage = {
  src: string;
  /** CSS object-position for the photo, e.g. "left 30%". Defaults to "center". */
  position?: string;
};

/** Top-of-page intro band shared by inner pages. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  image?: PageHeaderImage;
  children?: ReactNode;
}) {
  return (
    <header className={`relative overflow-hidden border-b border-line ${image ? "bg-white" : "bg-surface-2/60"}`}>
      {image ? (
        <>
          <Image
            src={image.src}
            alt=""
            fill
            preload
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: image.position ?? "center" }}
          />
          {/* Scrim: solid white behind the text (right in RTL), fading out toward the photo's subject. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-white/80 md:bg-transparent md:bg-linear-to-l md:from-white md:from-35% md:via-white/80 md:via-55% md:to-white/0"
          />
        </>
      ) : (
        <>
          <div className="motif-lattice absolute inset-0 opacity-[0.18]" aria-hidden="true" />
          <Diamond className="pointer-events-none absolute -end-10 -top-12 size-56 text-brand opacity-[0.07]" />
        </>
      )}
      <div className={`${container} relative ${image ? "py-14 sm:py-20 lg:py-24" : "py-12 sm:py-16"}`}>
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
