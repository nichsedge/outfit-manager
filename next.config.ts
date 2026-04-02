import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable server-side features we don't need for local-only PWA
  reactStrictMode: true,
};

export default nextConfig;
