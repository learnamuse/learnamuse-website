import Image from "next/image";
import styles from "./bot.module.css";

/**
 * The Learnamuse mascot: a green 3D bear with a headset and the brand badge.
 * Renders come from the bear used in the learner intro video (three.js), exported as
 * transparent PNGs in public/images/bot/ (WebP variants are built by optimize-images).
 */
export const BEAR_POSES = {
  wave: {
    src: "/images/bot/bear-wave.png",
    width: 977,
    height: 1248,
    alt: "خرس سبز لرناموز با هدست، دست تکان می‌دهد و سلام می‌کند",
  },
  phone: {
    src: "/images/bot/bear-phone.png",
    width: 1029,
    height: 1248,
    alt: "خرس سبز لرناموز گوشی‌ای را نشان می‌دهد که گفتگو با ربات روی آن باز است",
  },
  point: {
    src: "/images/bot/bear-point.png",
    width: 953,
    height: 1248,
    alt: "خرس سبز لرناموز با دست به کناری اشاره می‌کند",
  },
  celebrate: {
    src: "/images/bot/bear-celebrate.png",
    width: 1258,
    height: 1248,
    alt: "خرس سبز لرناموز با خوشحالی یک گواهی پایان دوره را بالا گرفته است",
  },
} as const;

export type BearPose = keyof typeof BEAR_POSES;

export function Bear({
  pose,
  sizes,
  className = "",
  preload = false,
  slow = false,
  decorative = false,
}: {
  pose: BearPose;
  /** next/image sizes hint, e.g. "(min-width: 1024px) 280px, 180px". */
  sizes: string;
  className?: string;
  preload?: boolean;
  /** Slower, offset bob so two bears on screen never move in lockstep. */
  slow?: boolean;
  /** Hide from assistive tech when the bear only repeats nearby text. */
  decorative?: boolean;
}) {
  const p = BEAR_POSES[pose];
  return (
    <div className={className}>
      <div className="relative">
        <div className={`${styles.float} ${slow ? styles.floatSlow : ""}`}>
          <Image
            src={p.src}
            alt={decorative ? "" : p.alt}
            width={p.width}
            height={p.height}
            sizes={sizes}
            preload={preload}
            className="relative z-10 h-auto w-full select-none"
            draggable={false}
          />
        </div>
        {/* soft contact shadow; breathes with the bob */}
        <div
          aria-hidden="true"
          className={`${styles.shadow} ${slow ? styles.shadowSlow : ""} absolute inset-x-[14%] -bottom-1 h-[6%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(43_85_16/0.35),rgb(43_85_16/0))]`}
        />
      </div>
    </div>
  );
}
