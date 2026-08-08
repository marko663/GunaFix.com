"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getContent } from "@/data/content";
import { defaultLocale, isLocale, localePath } from "@/data/site";

/**
 * `not-found.tsx` receives no params, so the locale is read back off the
 * pathname the visitor actually requested.
 */
export default function NotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const { ui } = getContent(locale);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-sm tracking-[0.2em] text-solar uppercase">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {ui.notFoundTitle}
      </h1>
      <p className="mt-4 text-lg text-white/60">{ui.notFoundBody}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href={localePath(locale, "/")}>
            <ArrowLeft className="size-4" />
            {ui.notFoundHome}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={localePath(locale, "/kontakt")}>{ui.notFoundContact}</Link>
        </Button>
      </div>
    </div>
  );
}
