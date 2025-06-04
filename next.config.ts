
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure the fallback object exists before attempting to modify it.
      if (!config.resolve.fallback) {
        config.resolve.fallback = {};
      }
      // Prevent 'async_hooks' from being bundled on the client
      // by providing an empty module fallback.
      config.resolve.fallback.async_hooks = false;
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
