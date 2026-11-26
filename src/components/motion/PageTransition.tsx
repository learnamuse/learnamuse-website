"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";

/**
 * Route transitions via React's <ViewTransition> (View Transitions API; stable in React 19.3 /
 * Next 16.4 App Router, no config). Keyed by pathname, so each navigation exits the old page
 * and enters the new one; header stays anchored (see motion.css). Query/hash changes and
 * in-page updates (default="none") never animate. Browsers without the API just swap instantly.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
