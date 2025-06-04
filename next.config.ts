
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // WARNING: Setting this to true can hide underlying TypeScript compilation errors.
    // While not directly related to 'async_hooks', it's important to be aware of.
    ignoreBuildErrors: true,
  },
  eslint: {
    // WARNING: Setting this to true can hide ESLint issues.
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

  // ==========================================================================
  // CRITICAL WEBPACK CONFIGURATION FOR 'async_hooks' RESOLUTION
  // ==========================================================================
  // This section is vital for preventing server-only modules (like 'async_hooks',
  // often used by OpenTelemetry/Genkit for server-side tracing) from being
  // incorrectly bundled into the client-side JavaScript. If this module is
  // included in the client bundle, it will cause a "Module not found" error
  // because 'async_hooks' is a Node.js native module and does not exist in browsers.
  webpack: (config, { isServer }) => {
    // This modification should ONLY apply to client-side bundles.
    if (!isServer) {
      // Ensure the 'resolve' object exists on the Webpack config.
      // This is defensive programming to prevent errors if 'resolve' is undefined.
      if (!config.resolve) {
        config.resolve = {};
      }
      // Ensure the 'fallback' object exists on 'config.resolve'.
      // The 'fallback' option allows us to define substitute modules for certain requests.
      if (!config.resolve.fallback) {
        config.resolve.fallback = {};
      }

      // Provide a 'false' fallback for 'async_hooks'.
      // This effectively tells Webpack (and Turbopack, aiming for compatibility)
      // to replace any 'require("async_hooks")' or 'import "async_hooks"'
      // statement in client-side code with an empty module.
      // This is the standard and recommended way to resolve this issue.
      config.resolve.fallback.async_hooks = false;

      // console.log('[Webpack Client Fallback] Applied for async_hooks'); // Uncomment for debugging build logs
    }

    // IMPORTANT: Always return the modified configuration object.
    return config;
  },
  // ==========================================================================
};

export default nextConfig;
