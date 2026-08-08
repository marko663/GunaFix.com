"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, localeNames, switchLocalePath, type Locale } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * DE / EN toggle shown in the top bar. Keeps the visitor on the page they
 * are reading: only the locale prefix of the current path changes.
 */
export function LanguageSwitcher({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={label}
    >
      {locales.map((code, index) => {
        const active = code === locale;
        return (
          <span key={code} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-1 h-3 w-px bg-white/20" />
            )}
            <Link
              href={switchLocalePath(pathname, code)}
              hrefLang={code}
              aria-current={active ? "true" : undefined}
              title={localeNames[code].long}
              className={cn(
                "px-1.5 py-1 text-xs font-semibold tracking-[0.14em] uppercase transition-colors",
                active ? "text-solar" : "text-white/50 hover:text-white"
              )}
            >
              {localeNames[code].short}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
