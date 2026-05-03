import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
    ],
  },
  // Required for better-sqlite3 native module
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
