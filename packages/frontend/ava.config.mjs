const config = {
  files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  nodeArguments: ['--loader=ts-node/esm'],
  environmentVariables: {
    NODE_ENV: 'test',
  },
  concurrency: 5,
  timeout: '30s',
  tap: true,
};

export default config;
