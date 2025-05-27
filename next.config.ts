import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
      allowedOrigins: [
        "localhost:3000", // Für lokale Entwicklung
        "https://xxxxx.vercel.app", // Web-URL
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sqadguezzocyda6u.public.blob.vercel-storage.com"
      }
    ]
  }
};

export default nextConfig;
