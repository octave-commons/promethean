export default {
  files: ['src/tests/**/*.test.ts'],
  extensions: { ts: 'module' },
  nodeArguments: ['--import=tsx'],
  timeout: '30s',
};
