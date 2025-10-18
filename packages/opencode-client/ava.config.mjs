// AVA configuration for @promethean/opencode-client
import baseConfig from '../../config/ava.config.base.mjs';

export default {
  ...baseConfig,
  files: [
    // Include our test files
    "src/tests/**/*.test.ts",
    // Include any existing test patterns
    "dist/tests/**/*.js",
    "dist/test/**/*.js",
    "dist/**/*.test.js",
    "dist/**/*.spec.js",
  ],
  // TypeScript compilation
  require: [
    // Add any required setup files
  ],
  // Environment variables for tests
  environmentVariables: {
    NODE_ENV: 'test',
    DEBUG: 'ollama-queue:*'
  },
  // Increase timeout for integration tests
  timeout: '60s',
  // Don't fail fast to see all test results
  failFast: false,
  // Enable source maps for better error reporting
  nodeArguments: ['--enable-source-maps'],
};