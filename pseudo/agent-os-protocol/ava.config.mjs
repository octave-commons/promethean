import { config } from '../../config/ava.config.mjs';

export default {
  ...config,
  files: ['src/tests/**/*.test.ts'],
};
