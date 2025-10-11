import { createConfig } from '../../config/ava.config.mjs';

export default createConfig({
  files: ['src/tests/**/*.test.ts'],
  helpers: ['src/tests/helpers/*.ts'],
});
