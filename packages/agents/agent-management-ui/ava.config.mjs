export default {
  ...await import("../../config/ava.config.mjs"),
  files: ["dist/**/*.test.js"],
  nodeArguments: ["--loader", "tsx"],
};