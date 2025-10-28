// Simple file scanning functionality to replace the original file-indexer
export { scanFiles } from './scan-files.js';
export type { IndexedFile, ScanFilesOptions, ScanFilesResult, ScanProgress } from './scan-files.js';

// Also provide the advanced persistence-based indexer
export { FileIndexer } from './file-indexer.js';
export type {
  FileIndexEntry,
  IndexingOptions,
  SearchResult,
  IndexingStats,
  FileIndexStoreEntry,
} from './types.js';
