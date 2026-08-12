/**
 * Locale definitions and the locale-neutral site configuration.
 *
 * Anything that reads the same in every language (company name, e-mail,
 * phone number, postal address) lives here. Translated copy lives in the
 * per-locale dictionaries in `de.ts` and `en.ts`.
 */

export const locales = ["de", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

/**
 * Set SITE_NOINDEX=true on demo and staging deployments. It blocks every
 * crawler and stamps `noindex` on every page, so a preview carrying
 * placeholder claims can never reach a search result.
 */
export const noIndex = process.env.SITE_NOINDEX === "true";

export const localeNames: Record<Locale, { short: string; long: string }> = {
  de: { short: "DE", long: "Deutsch" },
  en: { short: "EN", long: "English" },
};

/** HTML `lang` / OpenGraph locale tags. */
export const htmlLang: Record<Locale, string> = {
  de: "de",
  en: "en",
};

export const ogLocale: Record<Locale, string> = {
  de: "de_DE",
  en: "en_GB",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * The site's own address, used for canonical tags, OpenGraph, the sitemap
 * and robots.txt. Netlify sets `URL` to the primary site address at build
 * time, so a deployment is self-describing; set NEXT_PUBLIC_SITE_URL once a
 * custom domain is connected.
 */
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Agency credit in the footer. Set NEXT_PUBLIC_HIDE_CREDIT=true to remove it —
 * white-labelling is normally a paid option, so it is a switch rather than a
 * code change.
 */
export const agency = {
  name: "GunaFix",
  url: "https://gunafix.com",
  show: process.env.NEXT_PUBLIC_HIDE_CREDIT !== "true",
};

export const siteConfig = {
  name: "Solaris Industrial",
  shortName: "Solaris",
  url: siteUrl,
  tagline: "Smart Renewable Energy Solutions",
  email: "office@solaris-industrial.eu",
  phone: "+49 30 5683 4120",
  phoneHref: "+493056834120",
  address: {
    street: "Industriestraße 14",
    city: "10557 Berlin",
    country: "Deutschland",
  },
  timezone: "Europe/Berlin",
};

/** Route segments are shared across locales, so only the prefix changes. */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

/**
 * Swaps the locale prefix on the current pathname, so the language switcher
 * keeps the visitor on the page they are already reading.
 */
export function switchLocalePath(pathname: string, next: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = next;
    return `/${segments.join("/")}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}
