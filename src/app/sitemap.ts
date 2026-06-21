import type { MetadataRoute } from "next";

import { services, industries, technologies, siteConfig } from "@/data/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/services",
    "/industries",
    "/technologies",
    "/pricing",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const dynamicRoutes = [
    ...services.map((s) => `/services/${s.slug}`),
    ...industries.map((i) => `/industries/${i.slug}`),
    ...technologies.map((t) => `/technologies/${t.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));
}
