export { scanFiles } from './scan-files.js';
export type { IndexedFile, ScanFilesOptions, ScanFilesResult, ScanProgress } from './scan-files.js';
export {
  isDotFile,
  getDefaultIgnoreDirs,
  parseGitignore,
  createDefaultIgnorePredicate,
} from './gitignore-utils.js';
