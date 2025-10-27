import config from '../../config/ava.config.mjs';

export default {
  ...config,
  files: ['dist/tests/**/*.test.js'],
  nodeArguments: ['--loader=ts-node/esm'],
};
