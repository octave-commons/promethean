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
export function createUnifiedFileIndexer(_client: UnifiedIndexingClient): UnifiedFileIndexer {
  return {
    async indexDirectory(
      _path: string,
      _options?: FileIndexingOptions,
    ): Promise<FileIndexingStats> {
      // Mock implementation
      return {
        totalFiles: 0,
        indexedFiles: 0,
        skippedFiles: 0,
        errors: [],
        duration: 0,
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
