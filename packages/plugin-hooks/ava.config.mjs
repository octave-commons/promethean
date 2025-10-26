import baseConfig from '../../config/ava.config.mjs';

export default {
  ...baseConfig,
  files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  require: ['ts-node/register'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
};
