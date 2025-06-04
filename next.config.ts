
import type { NextConfig } from 'next';

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
  /**
   * Custom webpack configuration.
   * @param {import('webpack').Configuration} config - The webpack configuration object.
   * @param {object} options - Next.js build options.
   * @param {boolean} options.isServer - True if the build is for the server, false for the client.
   * @returns {import('webpack').Configuration} The modified webpack configuration.
   */
  webpack: (config, { isServer }) => {
    // Ensure config.resolve and config.resolve.fallback exist
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};

    if (!isServer) {
      // For client-side bundles, provide an empty module for 'async_hooks'.
      // This prevents the "Module not found: Can't resolve 'async_hooks'" error
      // which occurs because 'async_hooks' is a Node.js-specific module.
      config.resolve.fallback.async_hooks = false;
    }

    // It's good practice to return the modified config
    return config;
  },
  // Add the development server origin for Firebase Studio to allowedDevOrigins
  // to prevent cross-origin request errors.
  experimental: {
    allowedDevOrigins: [
      '6000-firebase-studio-1749042133846.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
      // You can add more trusted origins here if needed
    ],
  },
};

export default nextConfig;
