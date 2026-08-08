import type { MetadataRoute } from "next";

import { getContent } from "@/data/content";
import { locales, siteConfig } from "@/data/site";

const staticRoutes = [
  "",
  "/carports",
  "/groundforce",
  "/projekte",
  "/wissensdatenbank",
  "/kontakt",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.flatMap((locale) => {
    const content = getContent(locale);
    const paths = [
      ...staticRoutes,
      ...content.carports.map((c) => `/carports/${c.slug}`),
      ...content.projects.map((p) => `/projekte/${p.slug}`),
      ...content.articles.map((a) => `/wissensdatenbank/${a.slug}`),
    ];

    return paths.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: now,
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [code, `${siteConfig.url}/${code}${path}`])
        ),
      },
    }));
  });
}
