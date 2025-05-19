import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cdn.sanity.io",
      "images.unsplash.com",
    ],
  },
  /* config options here */
};

export default nextConfig;
