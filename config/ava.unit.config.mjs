import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load the shared AVA config
const baseConfig = require('./ava.config.mjs');

export default {
  ...baseConfig,
  files: [
    // Unit test specific patterns
    'packages/**/dist/**/*.unit.test.js',
    'packages/**/dist/**/*.unit.spec.js',
    'tests/unit/**/*.test.js',
    'tests/unit/**/*.spec.js',
    'tests/**/dist/**/*.unit.test.js',
    'tests/**/dist/**/*.unit.spec.js',
    // Generic test patterns (default to unit)
    'packages/**/dist/**/*.test.js',
    'packages/**/dist/**/*.spec.js',
    'services/**/dist/**/*.test.js',
    'services/**/dist/**/*.spec.js',
    'tests/**/dist/**/*.test.js',
    'tests/**/dist/**/*.spec.js',
  ],
  timeout: '10s', // Shorter timeout for unit tests
  failFast: false,
  concurrency: 10, // Higher concurrency for unit tests
  nodeArguments: [...baseConfig.nodeArguments, '--max-old-space-size=2048'],
};
