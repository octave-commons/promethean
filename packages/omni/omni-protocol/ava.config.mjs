import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(configDir, '..');

export default {
  files: ['dist/tests/**/*.test.js', 'dist/test/**/*.js', 'dist/**/*.test.js', 'dist/**/*.spec.js'],
  timeout: '30s',
  failFast: false,
  require: [path.join(workspaceRoot, 'config', 'ava-mock-polyfill.cjs')],
  nodeArguments: ['--enable-source-maps'],
};
