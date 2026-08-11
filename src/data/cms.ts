import "server-only";

import { client } from "../../sanity/lib/client";
import { siteQuery } from "../../sanity/lib/queries";
import { getContent } from "./content";
import { mergeSiteContent, type Raw } from "./cms-merge";
import type { Locale } from "./site";
import type { SiteContent } from "./types";

/* -------------------------------------------------------------------------- */
/* Public API                                                                 *//* -------------------------------------------------------------------------- */

/**
 * Content for a locale. Reads from Sanity when it is configured and merges
 * the result over the built-in dictionary, so an empty or partly filled CMS
 * still renders a complete site. Any network or parsing failure falls back
 * silently rather than taking the page down.
 */
export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  const base = getContent(locale);
  if (!client) return base;

  try {
    const raw = await client.fetch<Raw>(siteQuery, {}, { next: { revalidate: 60 } });
    if (!raw) return base;
    return mergeSiteContent(raw, locale, base);
  } catch (error) {
    console.error("[cms] Falling back to built-in content:", error);
    return base;
  }
}
