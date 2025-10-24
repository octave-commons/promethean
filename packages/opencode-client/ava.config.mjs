export default {
  files: ['dist/tests/**/*.test.js'],
  timeout: '30s',
  concurrency: 1, // Run tests serially to avoid database conflicts
  environmentVariables: {
    NODE_ENV: 'test',
  },
  nodeArguments: ['--enable-source-maps'],
};
