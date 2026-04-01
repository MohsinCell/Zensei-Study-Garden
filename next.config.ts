import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  devIndicators: false,
  async rewrites() {
    return [
      // Serve avatars via API route for runtime-uploaded files
      {
        source: "/avatars/:filename",
        destination: "/api/avatars/:filename",
      },
    ];
  },
};

export default nextConfig;
