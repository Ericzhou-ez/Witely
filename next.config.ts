/**
 * Next.js configuration file.
 * This file configures the build process and runtime behavior of the Next.js application.
 * 
 * Key configurations:
 * - Experimental Partial Prerendering (PPR): Enables streaming of static and dynamic content for improved performance.
 * - Images: Configures allowed remote image sources to prevent security issues and optimize loading.
 * 
 * For testing: This config ensures that images from Vercel storage are handled correctly in test environments.
 * Ensure that test setups mock or allow these hostnames.
 * 
 * @type {import('next').NextConfig}
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    // Note: PPR is experimental and may require updates in testing strategies for dynamic routes.
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "** .public.blob.vercel-storage.com",
      },
    ],
    // For tests, consider adding test-specific remote patterns if using mock images.
  },
};

export default nextConfig;
