import baseConfig from '../../config/ava.config.mjs';

export default {
  ...baseConfig,
  files: ['dist/tests/**/*.test.js'],
};
