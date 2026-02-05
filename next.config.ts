import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Optional: Set base path if needed
  // basePath: '',
  trailingSlash: true,
};

export default nextConfig;
