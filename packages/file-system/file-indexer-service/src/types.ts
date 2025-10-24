import type { DualStoreEntry } from '@promethean-os/persistence';

export interface FileIndexEntry {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  fileSize: number;
  lastModified: Date;
  fileType: string;
  metadata?: Record<string, any>;
}

export interface IndexingOptions {
  includePatterns?: string[];
  excludePatterns?: string[];
  maxFileSize?: number;
  followSymlinks?: boolean;
}

export interface SearchResult {
  entry: FileIndexEntry;
  score: number;
  highlights?: string[];
}

export interface IndexingStats {
  totalFiles: number;
  indexedFiles: number;
  skippedFiles: number;
  errors: string[];
  duration: number;
}

export type FileIndexStoreEntry = DualStoreEntry<'content', 'lastModified'> & {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
};
