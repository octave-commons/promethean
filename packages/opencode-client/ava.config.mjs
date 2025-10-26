import baseConfig from '../../config/ava.config.mjs';

// Override for opencode-client to silence console output during tests
export default {
  ...baseConfig,
  require: [...(baseConfig.require || []), './dist/test-setup.js'],
  exclude: [...(baseConfig.exclude || []), 'dist/tests/helpers/**', 'src/tests/helpers/**'],
};
