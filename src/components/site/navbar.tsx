"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";

import { mainNav, siteConfig } from "@/data/solaris";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [openForPathname, setOpenForPathname] = React.useState(pathname);

  if (pathname !== openForPathname) {
    setOpenForPathname(pathname);
    if (open) setOpen(false);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${siteConfig.name} – Startseite`}>
          <Logo compact />
        </Link>

        <nav className="hidden items-center gap-7 xl:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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

        <div className="hidden items-center gap-4 xl:flex">
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="hidden items-center gap-2 text-sm text-white/70 transition-colors hover:text-white 2xl:flex"
          >
            <Phone className="size-4" />
            {siteConfig.phone}
          </a>
          <Button asChild size="sm">
            <Link href="/kontakt">Projekt anfragen</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-md p-2 text-white xl:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black px-4 py-6 xl:hidden">
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
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
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild>
                <Link href="/kontakt">Projekt anfragen</Link>
              </Button>
              <a
                href={`tel:${siteConfig.phoneHref}`}
                className="flex items-center justify-center gap-2 py-2 text-sm text-white/70"
              >
                <Phone className="size-4" />
                {siteConfig.phone}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
