import { de } from "./de";
import { en } from "./en";
import type { Locale } from "./site";
import type { SiteContent } from "./types";

const dictionaries: Record<Locale, SiteContent> = { de, en };

export function getContent(locale: Locale): SiteContent {
  return dictionaries[locale];
}

export type { SiteContent };
export * from "./types";
export * from "./site";
