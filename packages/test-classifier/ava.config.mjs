import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load the shared AVA config
const baseConfig = require('../../config/ava.config.mjs');

export default {
  ...baseConfig,
  files: [
    ...baseConfig.files.map((pattern) => (pattern.startsWith('./') ? pattern : `./${pattern}`)),
    'dist/**/*.test.js',
  ],
  timeout: '30s',
  failFast: false,
};
