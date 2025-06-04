
/** @type {import('next').NextConfig} */

const nextConfig = {
  // ==========================================================================
  // BUILD PROCESS CONFIGURATION
  // ==========================================================================
  typescript: {
    // WARNING: Setting this to true can hide underlying TypeScript compilation errors.
    // This is kept as per your existing configuration.
    ignoreBuildErrors: true,
  },
  eslint: {
    // WARNING: Setting this to true can hide ESLint issues.
    // This is kept as per your existing configuration.
    ignoreDuringBuilds: true,
  },

  // ==========================================================================
  // IMAGE OPTIMIZATION
  // ==========================================================================
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

  // ==========================================================================
  // CRITICAL WEBPACK CONFIGURATION FOR 'async_hooks' RESOLUTION
  // ==========================================================================
  // This section is vital for preventing server-only modules (like 'async_hooks',
  // often used by OpenTelemetry/Genkit for server-side tracing) from being
  // incorrectly bundled into the client-side JavaScript. If this module is
  // included in the client bundle, it will cause a "Module not found" error
  // because 'async_hooks' is a Node.js native module and does not exist in browsers.
  webpack: (config, { isServer, webpack }) => {
    // This modification should ONLY apply to client-side bundles.
    if (!isServer) {
      // Ensure the 'resolve' object exists on the Webpack config.
      if (!config.resolve) {
        config.resolve = {};
      }
      // Ensure the 'fallback' object exists on 'config.resolve'.
      // Spread any existing fallbacks to preserve them, then add/override async_hooks.
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Preserve existing fallbacks
        async_hooks: false, // Explicitly set async_hooks to false for client bundles
      };
    }

    // IMPORTANT: Always return the modified configuration object.
    return config;
  },
  // ==========================================================================
};

export default nextConfig;
