export default {
  files: ['dist/tests/**/*.test.js', '!dist/tests/clojure-only.test.js'],
  nodeArguments: ['--loader', 'esmock'],
  timeout: '30s',
  concurrency: 1,
  verbose: true,
};
