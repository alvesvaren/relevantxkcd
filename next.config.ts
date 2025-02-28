import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "imgs.xkcd.com",
      },
    ],
  },
};

export default nextConfig;
