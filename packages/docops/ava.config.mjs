import base from "../../config/ava.config.mjs";

// Narrow test globs to avoid picking up stale compiled copies under dist/frontend/__tests__
export default {
  ...base,
  files: [
    "dist/tests/**/*.js",
    "!dist/tests/helpers/**/*.js",
    "dist/test/**/*.js",
    // intentionally omit generic "dist/**/*.test.js" to prevent duplicate runs
  ],
};
