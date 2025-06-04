
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
  webpack: (config, { isServer }) => {
    // Ensure the fallback object exists before attempting to modify it.
    // This handles a potential case where config.resolve or config.resolve.fallback might be undefined.
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};

    if (!isServer) {
      // Prevent 'async_hooks' from being bundled on the client
      // by providing an empty module fallback.
      config.resolve.fallback.async_hooks = false;
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
