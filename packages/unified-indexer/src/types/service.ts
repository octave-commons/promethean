/**
 * Service Types for Unified Indexer
 *
 * Types specific to the UnifiedIndexerService
 */

import type {
  UnifiedIndexingConfig,
  IndexingStats,
  ContentType,
  ContentSource,
  UnifiedIndexingClient,
} from '@promethean-os/persistence';

/**
 * File indexing options
 */
export interface FileIndexingOptions {
  readonly batchSize?: number;
  readonly excludePatterns?: readonly string[];
  readonly includePatterns?: readonly string[];
  readonly maxFileSize?: number;
  readonly followSymlinks?: boolean;
}

/**
 * File indexing statistics
 */
export interface FileIndexingStats {
  readonly totalFiles: number;
  readonly indexedFiles: number;
  readonly skippedFiles: number;
  readonly errors: readonly string[];
  readonly duration: number;
}

/**
 * Discord indexing statistics
 */
export interface DiscordIndexingStats {
  readonly totalMessages: number;
  readonly indexedMessages: number;
  readonly skippedMessages: number;
  readonly errors: readonly string[];
  readonly duration: number;
}

/**
 * OpenCode indexing statistics
 */
export interface OpenCodeIndexingStats {
  readonly totalItems: number;
  readonly indexedItems: number;
  readonly skippedItems: number;
  readonly errors: readonly string[];
  readonly duration: number;
}

/**
 * Kanban indexing statistics
 */
export interface KanbanIndexingStats {
  readonly totalItems: number;
  readonly indexedItems: number;
  readonly skippedItems: number;
  readonly errors: readonly string[];
  readonly duration: number;
}

/**
 * Unified indexer interfaces
 */
export interface UnifiedFileIndexer {
  readonly indexDirectory: (
    path: string,
    options?: FileIndexingOptions,
  ) => Promise<FileIndexingStats>;
}

export interface UnifiedDiscordIndexer {
  // Discord-specific methods
}

export interface UnifiedOpenCodeIndexer {
  // OpenCode-specific methods
}

export interface UnifiedKanbanIndexer {
  // Kanban-specific methods
}

/**
 * Factory functions for indexers
 */
export function createUnifiedFileIndexer(client: UnifiedIndexingClient): UnifiedFileIndexer {
  return {
    async indexDirectory(path: string, options?: FileIndexingOptions): Promise<FileIndexingStats> {
      const startTime = Date.now();

      try {
        const fs = await import('node:fs/promises');
        const { join, basename, extname } = await import('node:path');

        await fs.stat(path);

        const batchSize = options?.batchSize || 50;
        const maxFileSize = options?.maxFileSize || 10 * 1024 * 1024;
        const excludePatterns = options?.excludePatterns || [];
        const includePatterns = options?.includePatterns || [];

        const shouldProcessFile = (filePath: string): boolean => {
          const fileName = basename(filePath);

          if (excludePatterns.some((pattern) => fileName.includes(pattern))) {
            return false;
          }

          if (includePatterns.length > 0) {
            return includePatterns.some((pattern) => fileName.includes(pattern));
          }

          const textExtensions = [
            '.ts',
            '.js',
            '.tsx',
            '.jsx',
            '.md',
            '.txt',
            '.json',
            '.yaml',
            '.yml',
          ];
          return textExtensions.some((ext) => fileName.endsWith(ext));
        };

        const processDirectory = async (dirPath: string): Promise<readonly string[]> => {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });

          return entries.reduce(
            async (acc, entry) => {
              const currentAcc = await acc;
              const fullPath = join(dirPath, entry.name);

              if (entry.isDirectory()) {
                if (
                  entry.name.startsWith('.') ||
                  ['node_modules', 'dist', 'build', '.git'].includes(entry.name)
                ) {
                  return currentAcc;
                }
                return [...currentAcc, ...(await processDirectory(fullPath))];
              }

              if (entry.isFile() && shouldProcessFile(fullPath)) {
                return [...currentAcc, fullPath];
              }

              return currentAcc;
            },
            Promise.resolve([] as readonly string[]),
          );
        };

        const filesToProcess = await processDirectory(path);

        const processBatch = async (
          batch: readonly string[],
        ): Promise<readonly { indexed: boolean; error?: string }[]> => {
          return Promise.all(
            batch.map(async (filePath) => {
              try {
                const fileStat = await fs.stat(filePath);

                if (fileStat.size > maxFileSize) {
                  return { indexed: false };
                }

                const content = await fs.readFile(filePath, 'utf-8');

                const indexableContent = {
                  id: `file:${filePath}`,
                  type: 'file' as const,
                  source: 'filesystem' as const,
                  content: content,
                  metadata: {
                    type: 'file' as const,
                    source: 'filesystem' as const,
                    path: filePath,
                    size: fileStat.size,
                    lastModified: fileStat.mtime.getTime(),
                    extension: extname(filePath),
                  },
                  timestamp: fileStat.mtime.getTime(),
                };

                await client.index(indexableContent);
                return { indexed: true };
              } catch (error) {
                return {
                  indexed: false,
                  error: `Failed to index file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
              }
            }),
          );
        };

        const batches = Array.from(
          { length: Math.ceil(filesToProcess.length / batchSize) },
          (_, i) => filesToProcess.slice(i * batchSize, (i + 1) * batchSize),
        );

        const allResults = await Promise.all(batches.map(processBatch));
        const flatResults = allResults.flat();

        const indexedFiles = flatResults.filter((r) => r.indexed).length;
        const errors = flatResults.map((r) => r.error).filter((e): e is string => e !== undefined);
        const skippedFiles = flatResults.length - indexedFiles;

        return {
          totalFiles: filesToProcess.length,
          indexedFiles,
          skippedFiles,
          errors,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          totalFiles: 0,
          indexedFiles: 0,
          skippedFiles: 0,
          errors: [
            `Directory indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
          duration: Date.now() - startTime,
        };
      }
    },
  };
}

export function createUnifiedDiscordIndexer(_client: UnifiedIndexingClient): UnifiedDiscordIndexer {
  return {} as UnifiedDiscordIndexer;
}

export function createUnifiedOpenCodeIndexer(
  _client: UnifiedIndexingClient,
): UnifiedOpenCodeIndexer {
  return {} as UnifiedOpenCodeIndexer;
}

export function createUnifiedKanbanIndexer(_client: UnifiedIndexingClient): UnifiedKanbanIndexer {
  return {} as UnifiedKanbanIndexer;
}

/**
 * Configuration for unified indexer service
 */
export interface UnifiedIndexerServiceConfig {
  // Unified indexing client configuration
  readonly indexing: UnifiedIndexingConfig;

  // Context store configuration
  readonly contextStore: {
    readonly collections: {
      readonly files: string;
      readonly discord: string;
      readonly opencode: string;
      readonly kanban: string;
      readonly unified: string;
    };
    readonly formatTime?: (epochMs: number) => string;
    readonly assistantName?: string;
  };

  // Data source configurations
  readonly sources: {
    readonly files: {
      readonly enabled: boolean;
      readonly paths: readonly string[];
      readonly options?: FileIndexingOptions;
    };
    readonly discord: {
      readonly enabled: boolean;
      readonly provider?: string;
      readonly tenant?: string;
    };
    readonly opencode: {
      readonly enabled: boolean;
      readonly sessionId?: string;
    };
    readonly kanban: {
      readonly enabled: boolean;
      readonly boardId?: string;
    };
  };

  // Sync configuration
  readonly sync: {
    readonly interval: number; // milliseconds
    readonly batchSize: number;
    readonly retryAttempts: number;
    readonly retryDelay: number; // milliseconds
  };
}

/**
 * Indexing statistics for all sources
 */
export interface UnifiedIndexerStats {
  readonly total: IndexingStats;
  readonly bySource: Record<
    string,
    FileIndexingStats | DiscordIndexingStats | OpenCodeIndexingStats | KanbanIndexingStats
  >;
  readonly byType: Record<ContentType, number>;
  readonly lastSync: number;
  readonly syncDuration: number;
  readonly errors: readonly string[];
}

/**
 * Service status
 */
export interface ServiceStatus {
  readonly healthy: boolean;
  readonly indexing: boolean;
  readonly lastSync: number;
  readonly nextSync: number;
  readonly activeSources: readonly ContentSource[];
  readonly issues: readonly string[];
}
