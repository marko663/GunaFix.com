"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import { siteConfig, localePath, type Locale } from "@/data/site";
import type { SiteContent } from "@/data/types";
import { cn } from "@/lib/utils";

export function Navbar({ locale, content }: { locale: Locale; content: SiteContent }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [openForPathname, setOpenForPathname] = React.useState(pathname);

  if (pathname !== openForPathname) {
    setOpenForPathname(pathname);
    if (open) setOpen(false);
  }

  const isActive = (href: string) => {
    const full = localePath(locale, href);
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md">
      {/* Utility bar: contact details on the left, language switcher on the right. */}
      <div className="border-b border-white/10 bg-surface-2">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5 overflow-hidden">
            <a
              href={`tel:${siteConfig.phoneHref}`}
              className="flex items-center gap-2 text-xs whitespace-nowrap text-white/55 transition-colors hover:text-solar"
            >
              <Phone className="size-3.5" />
              {siteConfig.phone}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="hidden items-center gap-2 text-xs whitespace-nowrap text-white/55 transition-colors hover:text-solar sm:flex"
            >
              <Mail className="size-3.5" />
              {siteConfig.email}
            </a>
          </div>

          <LanguageSwitcher locale={locale} label={content.ui.languageLabel} />
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={localePath(locale, "/")} aria-label={content.ui.homeLinkLabel}>
            <Logo compact />
          </Link>

          <nav className="hidden items-center gap-7 xl:flex">
            {content.nav.map((item) => (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative py-2 text-[0.8rem] font-medium tracking-[0.08em] text-white/65 uppercase transition-colors hover:text-white",
                  isActive(item.href) && "text-white"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-solar" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:block">
            <Button asChild size="sm">
              <Link href={localePath(locale, "/kontakt")}>{content.ui.requestProject}</Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? content.ui.closeMenu : content.ui.openMenu}
            aria-expanded={open}
            className="inline-flex items-center justify-center rounded-md p-2 text-white xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-b border-white/10 bg-black px-4 py-6 xl:hidden">
          <nav className="flex flex-col gap-1">
            {content.nav.map((item) => (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                className={cn(
                  "border-l-2 py-3 pl-4 text-base font-medium tracking-wide uppercase",
                  isActive(item.href)
                    ? "border-solar text-white"
                    : "border-white/10 text-white/70"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href={localePath(locale, "/kontakt")}>{content.ui.requestProject}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
