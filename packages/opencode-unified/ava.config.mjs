import fs from 'node:fs';
import path from 'node:path';

// Simple AVA config for this package
export default {
  files: ['dist/**/*.test.js', './*.test.js'],
  timeout: '30s',
  failFast: false,
  nodeArguments: ['--enable-source-maps'],
  environmentVariables: {
    NODE_ENV: 'test',
  },
};
