import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';


const path = require("path");

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }) => {



    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
      config.resolve.alias['@'] = path.resolve(__dirname);
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