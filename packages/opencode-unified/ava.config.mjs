import { createConfig } from '../../config/ava.config.mjs';

export default createConfig({
  files: ['src/tests/**/*.test.ts', 'tests/**/*.test.ts'],
  nodeArguments: ['--loader=tsx'],
  environmentVariables: {
    NODE_ENV: 'test',
  },
});
