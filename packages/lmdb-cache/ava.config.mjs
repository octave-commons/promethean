import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const baseConfig = require("../../config/ava.config.mjs.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = __dirname;

export default {
  ...baseConfig,
  files: [
    "dist/tests/**/*.js",
    "dist/**/*.test.js",
    "dist/**/*.spec.js"
  ],
  projectRoot: packageRoot
};