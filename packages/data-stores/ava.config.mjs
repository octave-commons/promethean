export default {
  ...(await import('../../config/ava.config.mjs')),
  files: ['dist/tests/**/*.test.js'],
  nodeArguments: ['--import=tsx/cjs'],
};
