const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// Monorepo root (two levels up from apps/preview-Pro)
const monorepoRoot = path.resolve(__dirname, '../..');

/**
 * Metro configuration for NAHTREEK monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Watch the entire monorepo so shared packages are picked up
  watchFolders: [monorepoRoot],

  resolver: {
    // Tell Metro where to look for node_modules
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
