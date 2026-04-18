// Root AVA configuration for the workspace
// This file provides base AVA configuration shared across TypeScript projects

export default {
  files: [
    '**/*.test.{js,ts,mjs,cjs}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  extensions: {
    ts: 'module',
  },
  nodeArguments: [
    '--import=tsx',
    '--no-warnings',
  ],
  timeout: '2m',
  environmentVariables: {
    NODE_ENV: 'test',
  },
};
