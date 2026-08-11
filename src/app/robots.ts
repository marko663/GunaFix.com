import type { MetadataRoute } from "next";

import { noIndex, siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  // Demo and staging deployments are closed to crawlers entirely.
  if (noIndex) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/studio"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
