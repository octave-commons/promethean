import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load the shared AVA config
const baseConfig = require('./ava.config.mjs');

export default {
  ...baseConfig,
  files: [
    // E2E test specific patterns
    'packages/**/dist/**/*.e2e.test.js',
    'packages/**/dist/**/*.e2e.spec.js',
    'packages/**/dist/**/*.workflow.test.js',
    'packages/**/dist/**/*.workflow.spec.js',
    'packages/**/dist/**/*-e2e.test.js',
    'packages/**/dist/**/*-e2e.spec.js',
    'tests/e2e/**/*.test.js',
    'tests/e2e/**/*.spec.js',
    'tests/workflow/**/*.test.js',
    'tests/workflow/**/*.spec.js',
    'tests/**/dist/**/*.e2e.test.js',
    'tests/**/dist/**/*.e2e.spec.js',
  ],
  timeout: '300s', // Much longer timeout for E2E tests
  failFast: false,
  concurrency: 1, // Sequential execution for E2E tests
  nodeArguments: [...baseConfig.nodeArguments, '--max-old-space-size=8192'],
};
