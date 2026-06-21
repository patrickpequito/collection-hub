import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bungie.net",
        pathname: "/common/destiny2_content/icons/**",
      },
      {
        protocol: "https",
        hostname: "www.bungie.net",
        pathname: "/common/destiny2_content/screenshots/**",
      },
    ],
  },
};

export default nextConfig;
