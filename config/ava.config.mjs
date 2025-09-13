// Centralized AVA config for the monorepo
// Applies consistent file globs and a default timeout to prevent hanging tests.
export default {
  files: [
    // Compiled TS tests
    "dist/tests/**/*.js",
    "dist/test/**/*.js",
    "dist/**/*.test.js",
    "dist/**/*.spec.js",
  ],
  timeout: "30s",
  failFast: false,
  nodeArguments: ["--enable-source-maps"],
};
