import { site } from "@/lib/content";

export type NavItem = { label: string; route: string };

/** site.nav plus the certificates hub (which is not in the legacy WordPress menu). */
export function getNavItems(): NavItem[] {
  return [...site.nav, { label: "گواهی‌ها", route: "/certificates/" }];
}
