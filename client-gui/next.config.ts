import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',                   // frontend path
        destination: 'http://192.168.10.252:8000/:path*' // backend
      },
    ]
  },
  webpack: (config: Configuration, { isServer }) => {
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }

    // Force konva to use browser build
    (config.resolve.alias as Record<string, string | false | string[]>)['konva'] = 'konva/lib/index.js';

    // Prevent webpack from trying to bundle native 'canvas' on client
    if (!isServer) {
      (config.resolve.fallback as Record<string, any>)['canvas'] = false;
    }

    return config;
  },
};

export default nextConfig;