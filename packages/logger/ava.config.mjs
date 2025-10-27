/*
 * Ava configuration for @promethean/logger
 */
import { defaultConfig } from '../../config/ava.config.mjs';

export default {
  ...defaultConfig,
  files: ['src/tests/**/*.test.ts'],
};
