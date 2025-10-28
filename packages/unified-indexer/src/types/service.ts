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
