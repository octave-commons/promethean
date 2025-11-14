// Minimal AVA config for E2E-only runs (compiled JS)
export default {
  files: [
    'dist/tests/e2e/**/*.e2e.test.js'
  ],
  timeout: '5m',
  failFast: false,
  nodeArguments: ['--enable-source-maps']
}
