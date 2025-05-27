import type { NextConfig } from "next";

/**
 * Force fully dynamic output mode to avoid static export issues.
 * This is necessary when using useState and client hooks in the root App Router page,
 * which are incompatible with Next.js static generation/prerender.
 */
const nextConfig: NextConfig = {
  output: "standalone", // Use Node.js server output, no static export
  experimental: {
    // May be necessary in Next 15+ to fully disable static exports
    appDir: true,
  },
};

export default nextConfig;
