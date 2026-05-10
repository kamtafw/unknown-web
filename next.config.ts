import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'appscombo.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;


