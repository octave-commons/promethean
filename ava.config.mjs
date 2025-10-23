export default {
  files: ['**/*.{test,spec}.ts'],
  extensions: { ts: 'module' },
  nodeArguments: ['--import=ts-node/esm/register'],
  timeout: '30s',
  workerThreads: false,
  failFast: true,
  serial: false,
};
