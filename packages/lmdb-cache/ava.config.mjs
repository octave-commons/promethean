import path from 'node:path';
import { fileURLToPath } from 'node:url';

import baseConfig from '../../config/ava.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = __dirname;

export default {
  ...baseConfig,
  files: ['dist/tests/**/*.js', 'dist/**/*.test.js', 'dist/**/*.spec.js'],
  projectRoot: packageRoot,
};
