import { defineConfig } from 'ava';

export default defineConfig({
  files: ['test/**/*.test.ts'],
  nodeArguments: ['--loader', 'tsx'],
  timeout: '30s',
  concurrency: 4,
  verbose: true,
});