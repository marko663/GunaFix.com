"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

/**
 * The Studio is a browser application. Keeping it behind a client boundary
 * stops its dependencies resolving against React's server build, where some
 * of them (swr) expose no default export.
 */
export function StudioClient() {
  return <NextStudio config={config} />;
}
