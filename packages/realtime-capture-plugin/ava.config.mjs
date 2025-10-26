import { defaultConfig } from '../../config/ava.config.mjs';

export default {
  ...defaultConfig,
  files: ['dist-test/**/*.test.js'],
};
