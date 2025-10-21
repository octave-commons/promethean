export { FileIndexer } from './file-indexer.js';
export type {
  FileIndexEntry,
  IndexingOptions,
  SearchResult,
  IndexingStats,
  FileIndexStoreEntry,
} from './types.js';

// Re-export scanning utilities from @promethean/fs for compatibility
export { walkDir, listFiles, type FileEntry, type WalkOptions } from '@promethean/fs';
