
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
