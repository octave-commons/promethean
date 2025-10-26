import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectDir = dirname(fileURLToPath(import.meta.url));

export default {
  files: ['test/**/*.test.ts', 'test/**/*.test.js'],
  nodeArguments: ['--experimental-modules'],
  environmentVariables: {
    NODE_OPTIONS: '--experimental-modules',
  },
  ts: {
    rewritePaths: {
      'src/': 'dist/',
    },
  },
};
