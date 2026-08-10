import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales } from "@/data/site";

/**
 * Locale routing. Every public page lives under `/{locale}/…`; a request
 * without a locale prefix is redirected to the visitor's preferred language
 * when we support it, and to German otherwise.
 *
 * Renamed from `middleware` in Next.js 16.
 */
function preferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    const match = locales.find((locale) => locale === base);
    if (match) return match;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Everything except Next internals, the API, the editor, the dashboard
    // and static files. /studio must not be pushed into a locale prefix.
    "/((?!_next|api|studio|dashboard|.*\\..*).*)",
  ],
};
