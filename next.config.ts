import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Default bottom-left badge sits on the Hem tab in the mobile nav.
  devIndicators: false,
};

export default nextConfig;
