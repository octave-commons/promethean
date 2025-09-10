import base from "../../config/ava.config.mjs";

// Narrow files to only actual test files in dist
// Avoid picking up helpers or other support files.
export default {
  ...base,
  files: ["dist/tests/**/*.test.js"],
};
