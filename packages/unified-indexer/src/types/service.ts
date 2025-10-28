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
  batchSize?: number;
  excludePatterns?: string[];
  includePatterns?: string[];
  maxFileSize?: number;
  followSymlinks?: boolean;
}

/**
 * File indexing statistics
 */
export interface FileIndexingStats {
  totalFiles: number;
  indexedFiles: number;
  skippedFiles: number;
  errors: string[];
  duration: number;
}

/**
 * Discord indexing statistics
 */
export interface DiscordIndexingStats {
  totalMessages: number;
  indexedMessages: number;
  skippedMessages: number;
  errors: string[];
  duration: number;
}

/**
 * OpenCode indexing statistics
 */
export interface OpenCodeIndexingStats {
  totalItems: number;
  indexedItems: number;
  skippedItems: number;
  errors: string[];
  duration: number;
}

/**
 * Kanban indexing statistics
 */
export interface KanbanIndexingStats {
  totalItems: number;
  indexedItems: number;
  skippedItems: number;
  errors: string[];
  duration: number;
}

/**
 * Unified indexer interfaces
 */
export interface UnifiedFileIndexer {
  indexDirectory(path: string, options?: FileIndexingOptions): Promise<FileIndexingStats>;
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
 * Factory functions for indexers (temporary implementations)
 */
/**
 * Check if file should be processed based on patterns and extensions
 */
function shouldProcessFile(
  filePath: string,
  excludePatterns: string[],
  includePatterns: string[],
): boolean {
  const pathModule = require('node:path');
  const fileName = pathModule.basename(filePath);
  
  if (excludePatterns.some(pattern => fileName.includes(pattern))) {
    return false;
  }

  if (includePatterns.length > 0) {
    return includePatterns.some(pattern => fileName.includes(pattern));
  }

  const textExtensions = ['.ts', '.js', '.tsx', '.jsx', '.md', '.txt', '.json', '.yaml', '.yml', '.toml', '.env', '.gitignore', '.dockerfile'];
  return textExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Recursively process directory and return file paths
 */
async function processDirectory(
  dirPath: string,
  options: FileIndexingOptions,
  errors: string[],
): Promise<string[]> {
  const fs = await import('node:fs/promises');
  const pathModule = await import('node:path');
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = pathModule.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          continue;
        }
        files.push(...await processDirectory(fullPath, options, errors));
      } else if (entry.isFile() || (options.followSymlinks && entry.isSymbolicLink())) {
        if (shouldProcessFile(fullPath, options.excludePatterns || [], options.includePatterns || [])) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to read directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return files;
}

/**
 * Process a single file for indexing
 */
async function processFile(
  filePath: string,
  client: UnifiedIndexingClient,
  maxFileSize: number,
  errors: string[],
): Promise<boolean> {
  const fs = await import('node:fs/promises');
  const pathModule = await import('node:path');
  
  try {
    const fileStat = await fs.stat(filePath);
    
    if (fileStat.size > maxFileSize) {
      return false;
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
        extension: pathModule.extname(filePath),
      },
      timestamp: fileStat.mtime.getTime(),
    };

    await client.index(indexableContent);
    return true;
  } catch (error) {
    errors.push(`Failed to index file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

export function createUnifiedFileIndexer(client: UnifiedIndexingClient): UnifiedFileIndexer {
  return {
    async indexDirectory(path: string, options?: FileIndexingOptions): Promise<FileIndexingStats> {
      const startTime = Date.now();
      const stats: FileIndexingStats = {
        totalFiles: 0,
        indexedFiles: 0,
        skippedFiles: 0,
        errors: [],
        duration: 0,
      };

      try {
        const fs = await import('node:fs/promises');
        
        const stat = await fs.stat(path);
        if (!stat.isDirectory()) {
          throw new Error(`Path is not a directory: ${path}`);
        }

        const batchSize = options?.batchSize || 50;
        const maxFileSize = options?.maxFileSize || 10 * 1024 * 1024;
        const filesToProcess = await processDirectory(path, options || {}, stats.errors);
        
        stats.totalFiles = filesToProcess.length;

        for (let i = 0; i < filesToProcess.length; i += batchSize) {
          const batch = filesToProcess.slice(i, i + batchSize);
          
          const results = await Promise.all(
            batch.map(filePath => processFile(filePath, client, maxFileSize, stats.errors))
          );
          
          stats.indexedFiles += results.filter(Boolean).length;
          stats.skippedFiles += results.filter(result => !result).length;
        }

        stats.duration = Date.now() - startTime;
        return stats;
      } catch (error) {
        stats.duration = Date.now() - startTime;
        stats.errors.push(`Directory indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return stats;
      }
    },
  };
}
        } catch (error) {
          throw new Error(
            `Invalid path: ${path} - ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }

        const batchSize = options?.batchSize || 50;
        const excludePatterns = options?.excludePatterns || [];
        const includePatterns = options?.includePatterns || [];
        const maxFileSize = options?.maxFileSize || 10 * 1024 * 1024; // 10MB default
        const followSymlinks = options?.followSymlinks || false;

        // Helper function to check if file should be processed
        const shouldProcessFile = (filePath: string): boolean => {
          const fileName = pathModule.basename(filePath);

          // Check exclude patterns
          if (excludePatterns.some((pattern) => fileName.includes(pattern))) {
            return false;
          }

          // Check include patterns (if specified)
          if (includePatterns.length > 0) {
            return includePatterns.some((pattern) => fileName.includes(pattern));
          }

          // Check file extension
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
            '.toml',
            '.env',
            '.gitignore',
            '.dockerfile',
          ];
          return textExtensions.some((ext) => fileName.endsWith(ext));
        };

        // Recursive directory traversal
        const processDirectory = async (dirPath: string): Promise<string[]> => {
          const files: string[] = [];

          try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
              const fullPath = pathModule.join(dirPath, entry.name);

              if (entry.isDirectory()) {
                // Skip hidden directories and common ignore directories
                if (
                  entry.name.startsWith('.') ||
                  ['node_modules', 'dist', 'build', '.git'].includes(entry.name)
                ) {
                  continue;
                }
                files.push(...(await processDirectory(fullPath)));
              } else if (entry.isFile() || (followSymlinks && entry.isSymbolicLink())) {
                if (shouldProcessFile(fullPath)) {
                  files.push(fullPath);
                }
              }
            }
          } catch (error) {
            stats.errors.push(
              `Failed to read directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }

          return files;
        };

        // Get all files to process
        const filesToProcess = await processDirectory(path);
        stats.totalFiles = filesToProcess.length;

        // Process files in batches
        for (let i = 0; i < filesToProcess.length; i += batchSize) {
          const batch = filesToProcess.slice(i, i + batchSize);

          const batchPromises = batch.map(async (filePath) => {
            try {
              const fileStat = await fs.stat(filePath);

              // Skip files that are too large
              if (fileStat.size > maxFileSize) {
                stats.skippedFiles++;
                return null;
              }

              // Read file content
              const content = await fs.readFile(filePath, 'utf-8');

              // Create indexable content
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
                  extension: pathModule.extname(filePath),
                },
                timestamp: fileStat.mtime.getTime(),
              };

              // Index the content
              await client.index(indexableContent);
              stats.indexedFiles++;

              return indexableContent;
            } catch (error) {
              stats.errors.push(
                `Failed to index file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
              stats.skippedFiles++;
              return null;
            }
          });

          await Promise.all(batchPromises);
        }

        stats.duration = Date.now() - startTime;
        return stats;
      } catch (error) {
        stats.duration = Date.now() - startTime;
        stats.errors.push(
          `Directory indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        return stats;
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
  indexing: UnifiedIndexingConfig;

  // Context store configuration
  contextStore: {
    collections: {
      files: string;
      discord: string;
      opencode: string;
      kanban: string;
      unified: string;
    };
    formatTime?: (epochMs: number) => string;
    assistantName?: string;
  };

  // Data source configurations
  sources: {
    files: {
      enabled: boolean;
      paths: string[];
      options?: FileIndexingOptions;
    };
    discord: {
      enabled: boolean;
      provider?: string;
      tenant?: string;
    };
    opencode: {
      enabled: boolean;
      sessionId?: string;
    };
    kanban: {
      enabled: boolean;
      boardId?: string;
    };
  };

  // Sync configuration
  sync: {
    interval: number; // milliseconds
    batchSize: number;
    retryAttempts: number;
    retryDelay: number; // milliseconds
  };
}

/**
 * Indexing statistics for all sources
 */
export interface UnifiedIndexerStats {
  total: IndexingStats;
  bySource: Record<
    string,
    FileIndexingStats | DiscordIndexingStats | OpenCodeIndexingStats | KanbanIndexingStats
  >;
  byType: Record<ContentType, number>;
  lastSync: number;
  syncDuration: number;
  errors: string[];
}

/**
 * Service status
 */
export interface ServiceStatus {
  healthy: boolean;
  indexing: boolean;
  lastSync: number;
  nextSync: number;
  activeSources: ContentSource[];
  issues: string[];
}
