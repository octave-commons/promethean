import { createConfig } from 'ava';

export default createConfig({
  files: ['src/tests/**/*.test.ts'],
  timeout: '30s',
  concurrency: 1, // Run tests serially to avoid database conflicts
  environmentVariables: {
    NODE_ENV: 'test',
  },
  nodeArguments: ['--loader=tsx'],
});
