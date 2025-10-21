import { config } from '../../config/ava.config.mjs';

export default {
  ...config,
  files: ['test/**/*.test.ts'],
  nodeArguments: ['--loader=tsx'],
};
