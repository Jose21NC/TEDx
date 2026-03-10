import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a fully static export (replaces legacy `next export`)
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
