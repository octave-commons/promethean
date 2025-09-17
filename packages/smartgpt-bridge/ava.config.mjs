import base from "../../config/ava.config.mjs";

// Narrow files to only actual test files in dist
// Avoid picking up helpers or other support files.
const requireHooks = Array.isArray(base.require) ? [...base.require] : [];
requireHooks.push("./dist/tests/helpers/bootstrap.js");

export default {
  ...base,
  files: ["dist/tests/**/*.test.js"],
  require: requireHooks,
};
