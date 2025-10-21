export default {
  ...(await import('../../config/ava.config.mjs')),
  files: ['src/tests/**/*.test.ts'],
};
