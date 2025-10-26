export default {
  ...(await import('../../config/ava.config.mjs')),
  files: ['src/tests/**/*.test.ts'],
  nodeArguments: ['--loader', 'ts-node/esm'],
};
