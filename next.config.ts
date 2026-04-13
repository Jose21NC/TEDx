import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a fully static export (replaces legacy `next export`)
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
    ],
  },
};

export default nextConfig;
