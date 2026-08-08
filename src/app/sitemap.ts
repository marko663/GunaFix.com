import type { MetadataRoute } from "next";

import { articles, carports, projects, siteConfig } from "@/data/solaris";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/carports",
    "/groundforce",
    "/projekte",
    "/wissensdatenbank",
    "/kontakt",
    "/impressum",
    "/datenschutz",
  ];

  const dynamicRoutes = [
    ...carports.map((c) => `/carports/${c.slug}`),
    ...projects.map((p) => `/projekte/${p.slug}`),
    ...articles.map((a) => `/wissensdatenbank/${a.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));
}
