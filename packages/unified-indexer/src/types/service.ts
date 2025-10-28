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
/**
 * Safe directory indexing with functional error handling
 */
async function safeIndexDirectory(
  path: string,
  options: FileIndexingOptions | undefined,
  client: UnifiedIndexingClient,
): Promise<Omit<FileIndexingStats, 'duration'>> {
  const exists = await checkPathExists(path);
  if (!exists) {
    return createErrorStats('Directory does not exist');
  }

  const files = await collectFiles(path, options);
  const results = await processFiles(files, options, client);
  
  return {
    totalFiles: files.length,
    indexedFiles: results.filter((r) => r.indexed).length,
    skippedFiles: results.filter((r) => !r.indexed).length,
    errors: results.map((r) => r.error).filter((e): e is string => e !== undefined),
  };
}

/**
 * Check if path exists
 */
async function checkPathExists(path: string): Promise<boolean> {
  const fs = await import('node:fs/promises');
  return fs.stat(path).then(() => true).catch(() => false);
}

/**
 * Create error statistics
 */
function createErrorStats(error: string): Omit<FileIndexingStats, 'duration'> {
  return {
    totalFiles: 0,
    indexedFiles: 0,
    skippedFiles: 0,
    errors: [error],
  };
}

/**
 * Collect all files from directory
 */
async function collectFiles(
  path: string,
  options: FileIndexingOptions | undefined,
): Promise<readonly string[]> {
  const fs = await import('node:fs/promises');
  const { join } = await import('node:path');
  
  const entries = await fs.readdir(path, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(path, entry.name);
      
      if (entry.isDirectory() && shouldProcessDirectory(entry.name)) {
        return collectFiles(fullPath, options);
      }
      
      if (entry.isFile() && shouldProcessFile(fullPath, options)) {
        return [fullPath];
      }
      
      return [] as readonly string[];
    }),
  );
  
  return files.flat();
}

/**
 * Check if directory should be processed
 */
function shouldProcessDirectory(name: string): boolean {
  return !name.startsWith('.') && !['node_modules', 'dist', 'build', '.git'].includes(name);
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath: string, options: FileIndexingOptions | undefined): boolean {
  const { basename } = require('node:path');
  const fileName = basename(filePath);
  
  const excludePatterns = options?.excludePatterns ?? [];
  const includePatterns = options?.includePatterns ?? [];
  
  if (excludePatterns.some((pattern) => fileName.includes(pattern))) {
    return false;
  }
  
  if (includePatterns.length > 0) {
    return includePatterns.some((pattern) => fileName.includes(pattern));
  }
  
  const textExtensions = ['.ts', '.js', '.tsx', '.jsx', '.md', '.txt', '.json', '.yaml', '.yml'];
  return textExtensions.some((ext) => fileName.endsWith(ext));
}

/**
 * Process files in batches
 */
async function processFiles(
  files: readonly string[],
  options: FileIndexingOptions | undefined,
  client: UnifiedIndexingClient,
): Promise<readonly { indexed: boolean; error?: string }[]> {
  const batchSize = options?.batchSize || 50;
  const batches = createBatches(files, batchSize);
  
  const results = await Promise.all(
    batches.map((batch) => processBatch(batch, options, client)),
  );
  
  return results.flat();
}

/**
 * Create batches from array
 */
function createBatches<T>(items: readonly T[], batchSize: number): readonly T[][] {
  return Array.from(
    { length: Math.ceil(items.length / batchSize) },
    (_, i) => items.slice(i * batchSize, (i + 1) * batchSize),
  );
}

/**
 * Process a single batch of files
 */
async function processBatch(
  batch: readonly string[],
  options: FileIndexingOptions | undefined,
  client: UnifiedIndexingClient,
): Promise<readonly { indexed: boolean; error?: string }[]> {
  return Promise.all(
    batch.map((filePath) => processSingleFile(filePath, options, client)),
  );
}

/**
 * Process a single file
 */
async function processSingleFile(
  filePath: string,
  options: FileIndexingOptions | undefined,
  client: UnifiedIndexingClient,
): Promise<{ indexed: boolean; error?: string }> {
  const maxFileSize = options?.maxFileSize || 10 * 1024 * 1024;
  
  const fileResult = await safeReadFile(filePath, maxFileSize);
  if (!fileResult.success || !fileResult.content) {
    return { indexed: false, error: fileResult.error };
  }
  
  const indexResult = await safeIndexContent(filePath, fileResult.content, client);
  return indexResult;
}

/**
 * Safely read file with size limit
 */
async function safeReadFile(
  filePath: string,
  maxSize: number,
): Promise<{ success: boolean; content?: string; error?: string }> {
  const fs = await import('node:fs/promises');
  
  try {
    const stat = await fs.stat(filePath);
    if (stat.size > maxSize) {
      return { success: false, error: `File too large: ${filePath}` };
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Safely index content
 */
async function safeIndexContent(
  filePath: string,
  content: string,
  client: UnifiedIndexingClient,
): Promise<{ indexed: boolean; error?: string }> {
  const { extname } = await import('node:path');
  
  try {
    const indexableContent = {
      id: `file:${filePath}`,
      type: 'file' as const,
      source: 'filesystem' as const,
      content,
      metadata: {
        type: 'file' as const,
        source: 'filesystem' as const,
        path: filePath,
        size: content.length,
        lastModified: Date.now(),
        extension: extname(filePath),
      },
      timestamp: Date.now(),
    };
    
    await client.index(indexableContent);
    return { indexed: true };
  } catch (error) {
    return {
      indexed: false,
      error: `Failed to index ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function createUnifiedFileIndexer(client: UnifiedIndexingClient): UnifiedFileIndexer {
  return {
    async indexDirectory(path: string, options?: FileIndexingOptions): Promise<FileIndexingStats> {
      const startTime = Date.now();
      const result = await safeIndexDirectory(path, options, client);
      return {
        ...result,
        duration: Date.now() - startTime,
      };
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
