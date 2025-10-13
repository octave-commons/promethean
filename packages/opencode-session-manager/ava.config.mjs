import { config } from '../../config/ava.config.mjs';

export default {
  ...config,
  files: ['dist/**/*.test.js', 'src/**/*.test.cljs'],
};
