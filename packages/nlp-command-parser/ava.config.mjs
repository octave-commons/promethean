/**
 * AVA Configuration for NLP Command Parser
 * Extends the base configuration from the workspace
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load base config
const baseConfig = require('../../config/ava.config.mjs');

export default {
  ...baseConfig,
  files: ['src/tests/**/*.test.ts'],
  nodeArguments: ['--loader=ts-node/esm', '--experimental-specifier-resolution=node'],
  environmentVariables: {
    NODE_ENV: 'test',
  },
};
