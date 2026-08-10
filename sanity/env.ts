/**
 * Sanity connection settings.
 *
 * The site runs perfectly well without these: when `projectId` is empty the
 * data layer falls back to the dictionaries in `src/data/de.ts` and `en.ts`,
 * so nothing breaks before the CMS is connected.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

/** True once a project has been configured, i.e. the CMS is live. */
export const cmsEnabled = projectId !== "";
