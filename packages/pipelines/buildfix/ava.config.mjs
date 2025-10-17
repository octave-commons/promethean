import base from '../../config/ava.config.mjs';

export default {
  ...base,
  files: ['dist/tests/*.js', 'dist/timeout/tests/*.js'],
};
