import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load the shared AVA config
const baseConfig = require('./ava.config.mjs');

export default {
  ...baseConfig,
  files: [
    // Integration test specific patterns
    'packages/**/dist/**/*.integration.test.js',
    'packages/**/dist/**/*.integration.spec.js',
    'packages/**/dist/**/*-integration.test.js',
    'packages/**/dist/**/*-integration.spec.js',
    'tests/integration/**/*.test.js',
    'tests/integration/**/*.spec.js',
    'tests/**/dist/**/*.integration.test.js',
    'tests/**/dist/**/*.integration.spec.js',
  ],
  timeout: '60s', // Longer timeout for integration tests
  failFast: false,
  concurrency: 3, // Lower concurrency for integration tests
  nodeArguments: [...baseConfig.nodeArguments, '--max-old-space-size=4096'],
};
