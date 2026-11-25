import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import { container, btnPrimary } from "@/components/ui/styles";
import { ArrowForward } from "@/components/ui/icons";
import { getNavItems } from "./nav";
import { NavLinks, MobileMenu } from "./NavClient";

export function Header() {
  const items = getNavItems();
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70 print:hidden">
      <div className={`${container} flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]`}>
        <Link href="/" className="flex shrink-0 items-center rounded-lg" aria-label={`${site.name} — صفحهٔ اصلی`}>
          <Image
            src={site.logo.full}
            alt={`${site.name} | ${site.nameEn}`}
            width={1573}
            height={655}
            sizes="128px"
            preload
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav aria-label="منوی اصلی" className="hidden md:block">
          <NavLinks items={items} />
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/contact-us/" className={`${btnPrimary} hidden !py-2.5 sm:inline-flex`}>
            همکاری با ما
            <ArrowForward className="size-4" />
          </Link>
          <MobileMenu items={items} />
        </div>
      </div>
    </header>
  );
}
