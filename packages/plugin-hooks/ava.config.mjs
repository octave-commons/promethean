import { config } from '../../config/ava.config.mjs';

export default {
  ...config,
  files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  require: ['ts-node/register'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
};
