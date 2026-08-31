import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    incomingRequests: true,
    fetches: {
      fullUrl: true,
    },
    browserToTerminal: true,
  },
};

export default nextConfig;
