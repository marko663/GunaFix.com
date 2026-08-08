import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/solaris";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
