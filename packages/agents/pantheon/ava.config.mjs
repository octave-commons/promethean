import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

export default {
  files: [
    `${path.relative(process.cwd(), path.join(projectRoot, 'dist', 'tests', '**', '*.js'))}`,
    `${path.relative(process.cwd(), path.join(projectRoot, 'dist', '**', '*.test.js'))}`,
    `${path.relative(process.cwd(), path.join(projectRoot, 'dist', '**', '*.spec.js'))}`,
  ],
  timeout: '30s',
  failFast: false,
};
