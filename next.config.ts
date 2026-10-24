import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: '/logo.jpg',
        destination: '/pandit-logo.png',
        permanent: true,
      },
      {
        source: '/logo.jpeg',
        destination: '/pandit-logo.png',
        permanent: true,
      },
      // Locality 404 Fix Redirects
      {
        source: '/pandit/kormangala/:service*',
        destination: '/pandit/koramangala/:service*',
        permanent: true,
      },
      {
        source: '/pandit/electroniccity/:service*',
        destination: '/pandit/electronic-city/:service*',
        permanent: true,
      },
      {
        source: '/pandit/hsr/:service*',
        destination: '/pandit/hsr-layout/:service*',
        permanent: true,
      },
      {
        source: '/pandit/btm/:service*',
        destination: '/pandit/btm-layout/:service*',
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;