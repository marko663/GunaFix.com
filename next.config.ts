import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photographs uploaded through the CMS are served from Sanity's CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
