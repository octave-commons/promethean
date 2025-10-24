import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, basename } from 'node:path';
import { DualStoreManager } from '@promethean-os/persistence';
import { listFiles } from '@promethean-os/fs';
import { validateFileSystemPath } from './path-validation.js';

import type {
  FileIndexEntry,
  IndexingOptions,
  SearchResult,
  IndexingStats,
  FileIndexStoreEntry,
} from './types.js';

export class FileIndexer {
  private dualStore!: DualStoreManager<'content', 'lastModified'>;
  private collectionName: string;

  constructor(collectionName: string = 'file_index') {
    this.collectionName = collectionName;
  }

  async initialize(): Promise<void> {
    this.dualStore = await DualStoreManager.create<'content', 'lastModified'>(
      this.collectionName,
      'content',
      'lastModified',
    );
  }

  async indexDirectory(
    directoryPath: string,
    options: IndexingOptions = {},
  ): Promise<IndexingStats> {
    const startTime = Date.now();
    const stats: IndexingStats = {
      totalFiles: 0,
      indexedFiles: 0,
      skippedFiles: 0,
      errors: [],
      duration: 0,
    };

    try {
      const files = await this.scanDirectory(directoryPath, options);
      stats.totalFiles = files.length;

      for (const filePath of files) {
        try {
          await this.indexFile(filePath, options);
          stats.indexedFiles++;
        } catch (error) {
          stats.skippedFiles++;
          stats.errors.push(
            `${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    } catch (error) {
      stats.errors.push(
        `Directory scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    stats.duration = Date.now() - startTime;
    return stats;
  }

  async indexFile(filePath: string, options: IndexingOptions = {}): Promise<FileIndexEntry> {
    // CRITICAL SECURITY: Validate path to prevent traversal attacks
    const validatedPath = validateFileSystemPath(filePath);

    const fileStats = await stat(validatedPath);
    const content = await readFile(validatedPath, 'utf-8');

    const entry: FileIndexEntry = {
      id: randomUUID(),
      filePath: validatedPath, // Use validated path
      fileName: basename(validatedPath),
      content,
      fileSize: fileStats.size,
      lastModified: fileStats.mtime,
      fileType: extname(validatedPath).toLowerCase().slice(1) || 'unknown',
      metadata: {
        indexedAt: new Date(),
        ...options,
      },
    };

    const storeEntry: FileIndexStoreEntry = {
      id: entry.id,
      content: entry.content,
      lastModified: entry.lastModified.getTime(),
      filePath: entry.filePath, // Already validated
      fileName: entry.fileName,
      fileSize: entry.fileSize,
      fileType: entry.fileType,
      metadata: entry.metadata,
    };

    await this.dualStore.insert(storeEntry);
    return entry;
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    const relevantDocs = await this.dualStore.getMostRelevant([query], limit);

    return relevantDocs.map((doc) => ({
      entry: {
        id: doc.id || '',
        filePath: (doc.metadata?.filePath as string) || '',
        fileName: (doc.metadata?.fileName as string) || '',
        content: doc.text,
        fileSize: (doc.metadata?.fileSize as number) || 0,
        lastModified: new Date(doc.timestamp),
        fileType: (doc.metadata?.fileType as string) || 'unknown',
        metadata: doc.metadata,
      },
      score: 1.0, // DualStoreManager doesn't provide scores, so we use a default
      highlights: [], // Could be implemented with text highlighting logic
    }));
  }

  async getFileByPath(filePath: string): Promise<FileIndexEntry | null> {
    // Search by file path in metadata
    const allDocs = await this.dualStore.getMostRecent(1000); // Adjust limit as needed
    const doc = allDocs.find((d) => d.metadata?.filePath === filePath);

    if (!doc) return null;

    return {
      id: doc.id || '',
      filePath: (doc.metadata?.filePath as string) || '',
      fileName: (doc.metadata?.fileName as string) || '',
      content: doc.text,
      fileSize: (doc.metadata?.fileSize as number) || 0,
      lastModified: new Date(doc.timestamp),
      fileType: (doc.metadata?.fileType as string) || 'unknown',
      metadata: doc.metadata,
    };
  }

  async getRecentFiles(limit: number = 10): Promise<FileIndexEntry[]> {
    const recentDocs = await this.dualStore.getMostRecent(limit);

    return recentDocs.map((doc) => ({
      id: doc.id || '',
      filePath: (doc.metadata?.filePath as string) || '',
      fileName: (doc.metadata?.fileName as string) || '',
      content: doc.text,
      fileSize: (doc.metadata?.fileSize as number) || 0,
      lastModified: new Date(doc.timestamp),
      fileType: (doc.metadata?.fileType as string) || 'unknown',
      metadata: doc.metadata,
    }));
  }

  async removeFile(filePath: string): Promise<boolean> {
    try {
      const fileEntry = await this.getFileByPath(filePath);
      if (!fileEntry) return false;

      const mongoCollection = this.dualStore.getMongoCollection();
      const result = await mongoCollection.deleteOne({ id: fileEntry.id });

      // Also remove from ChromaDB
      const chromaCollection = this.dualStore.getChromaCollection();
      await chromaCollection.delete({ ids: [fileEntry.id] });

      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Failed to remove file ${filePath}:`, error);
      return false;
    }
  }

  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    fileTypes: Record<string, number>;
  }> {
    const allDocs = await this.dualStore.getMostRecent(10000); // Large limit to get all docs
    const fileTypes: Record<string, number> = {};
    let totalSize = 0;

    for (const doc of allDocs) {
      const fileType = (doc.metadata?.fileType as string) || 'unknown';
      fileTypes[fileType] = (fileTypes[fileType] || 0) + 1;
      totalSize += (doc.metadata?.fileSize as number) || 0;
    }

    return {
      totalFiles: allDocs.length,
      totalSize,
      fileTypes,
    };
  }

  private async scanDirectory(
    directoryPath: string,
    options: IndexingOptions = {},
  ): Promise<string[]> {
    // CRITICAL SECURITY: Validate path to prevent traversal attacks
    const validatedPath = validateFileSystemPath(directoryPath);

    const fileEntries = await listFiles(validatedPath, {
      includeHidden: false,
      maxDepth: options.followSymlinks === false ? 1 : undefined,
    });

    return fileEntries
      .filter((entry) => this.shouldIncludeFile(entry.path, options))
      .map((entry) => entry.path);
  }

  private shouldIncludeFile(filePath: string, options: IndexingOptions): boolean {
    const fileName = basename(filePath);
    const fileExt = extname(filePath).toLowerCase();

    // Check exclude patterns
    if (options.excludePatterns) {
      for (const pattern of options.excludePatterns) {
        if (fileName.includes(pattern) || filePath.includes(pattern)) {
          return false;
        }
      }
    }

    // Check include patterns (if specified)
    if (options.includePatterns && options.includePatterns.length > 0) {
      return options.includePatterns.some(
        (pattern) =>
          fileName.includes(pattern) || fileExt.includes(pattern) || filePath.includes(pattern),
      );
    }

    // Default exclude common non-text files
    const excludeExtensions = ['.exe', '.dll', '.so', '.dylib', '.bin', '.img', '.iso'];
    if (excludeExtensions.includes(fileExt)) {
      return false;
    }

    return true;
  }

  async cleanup(): Promise<void> {
    if (this.dualStore) {
      await this.dualStore.cleanup();
    }
  }
}
