import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

import { apiVersion, dataset, projectId, cmsEnabled } from "../env";

export const client = cmsEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Published content only, served from the CDN.
      useCdn: true,
      perspective: "published",
    })
  : null;

const builder = cmsEnabled ? imageUrlBuilder({ projectId, dataset }) : null;

/** Resolve a Sanity image reference to a sized, optimised URL. */
export function imageUrl(source: unknown, width = 1600): string | undefined {
  if (!builder || !source) return undefined;
  try {
    return builder.image(source as never).width(width).auto("format").fit("max").url();
  } catch {
    return undefined;
  }
}
