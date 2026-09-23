import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Server actions cap request bodies at 1MB by default, which is the right
     * default and the wrong one for the single action that carries a file. The
     * resume upload validates its own limit at 5MB (lib/models/resume.ts); this
     * has to sit above that so an oversized file reaches the action and gets a
     * readable message instead of being rejected by the framework as a 413.
     */
    serverActions: { bodySizeLimit: '6mb' },
  },
};

export default nextConfig;
