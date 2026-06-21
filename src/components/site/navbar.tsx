"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Wrench } from "lucide-react";

import { mainNav, siteConfig } from "@/data/content";
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
            <Wrench className="size-4" />
          </span>
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-white/70 transition-colors hover:text-white",
                pathname === item.href && "text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/contact">Book a call</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/contact">Start Your Project</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#05070a] px-4 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium text-white/80 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/contact">Book a call</Link>
              </Button>
              <Button asChild>
                <Link href="/contact">Start Your Project</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
