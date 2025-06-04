
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Ensure config.resolve and config.resolve.fallback exist
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};

    if (!isServer) {
      // For client-side bundles, provide an empty module for 'async_hooks'
      // This prevents the "Module not found: Can't resolve 'async_hooks'" error.
      config.resolve.fallback.async_hooks = false;
    }

    // It's good practice to return the modified config
    return config;
  },
};

export default nextConfig;
