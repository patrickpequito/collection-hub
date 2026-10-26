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
      {
        protocol: "https",
        hostname: "www.bungie.net",
        pathname: "/img/destiny_content/items/**",
      },
    ],
  },
  // Director UI redesign: PvE / PvP index pages merged into the Activities hub,
  // and the raids & dungeons hub moved from /rad-loot to /activities.
  async redirects() {
    return [
      {
        source: "/pve-activities",
        destination: "/activities#playlists",
        permanent: true,
      },
      {
        source: "/pvp-activities",
        destination: "/activities#playlists",
        permanent: true,
      },
      {
        source: "/rad-loot",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/rad-loot/:slug",
        destination: "/activities/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
