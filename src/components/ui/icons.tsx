/** Minimal inline icon set (stroke icons, 24px grid). Decorative by default. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Svg({ className = "size-5", children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Points "forward" in RTL reading direction (i.e. to the left). */
export const ArrowForward = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
/** Points "back" in RTL (to the right). */
export const ArrowBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ChevronForward = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);
export const Menu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);
export const Close = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);
export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const ShieldCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5.5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V6l7-3z" />
    <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
  </Svg>
);
export const Printer = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 9V3h10v6M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
    <path d="M7 14h10v7H7z" />
  </Svg>
);
export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1-1" />
  </Svg>
);
export const Share = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
  </Svg>
);
export const Calendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);
export const Clock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const Users = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
    <path d="M16 5.2a3.5 3.5 0 010 6.6M18.5 14.8c1.6.8 2.7 2.6 3 5.2" />
  </Svg>
);
export const Sparkles = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </Svg>
);
export const School = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9.5L12 5l9 4.5-9 4.5z" />
    <path d="M7 11.5V16c1.5 1.5 3.2 2.2 5 2.2s3.5-.7 5-2.2v-4.5M21 9.5V15" />
  </Svg>
);
export const Mail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M4 7.5l8 5.5 8-5.5" />
  </Svg>
);
export const Telegram = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M21.4 4.2a1.3 1.3 0 00-1.4-.2L3.1 10.6c-1 .4-1 1.8.1 2.1l4.2 1.3 1.6 5c.3.9 1.4 1.1 2 .4l2.3-2.4 4.2 3.1c.8.6 1.9.1 2.1-.8l2.7-13.9c.1-.5 0-.9-.4-1.2zM9.8 14.3l-.6 3.1-1-3.5 9.4-6.3-7.8 6.7z" />
  </svg>
);
export const Bolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2.5L4.5 13.5H12l-1 8 8.5-11H12z" />
  </Svg>
);
export const HandHeart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 10.5S8 8 8 5.6A2.2 2.2 0 0112 4.4a2.2 2.2 0 014 1.2c0 2.4-4 4.9-4 4.9z" />
    <path d="M3 14.5h3l3.5-1.5H14a1.5 1.5 0 010 3h-3.5M14 16h3.5l2.7-2.2a1.4 1.4 0 011.8 2.1L17.5 20H6.5L3 19" />
  </Svg>
);
export const Inclusive = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="4.5" r="2" />
    <circle cx="5" cy="8" r="1.8" />
    <circle cx="19" cy="8" r="1.8" />
    <path d="M12 8.5v5M8.5 21l3.5-7.5 3.5 7.5M3 13.5c.5-1.6 1.2-2.5 2-2.5s1.5.9 2 2.5M17 13.5c.5-1.6 1.2-2.5 2-2.5s1.5.9 2 2.5" />
  </Svg>
);
export const External = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
  </Svg>
);
