/**
 * Service Types for Unified Indexer
 *
 * Types specific to the UnifiedIndexerService
 */

import type {
  UnifiedIndexingConfig,
  FileIndexingOptions,
  FileIndexingStats,
  DiscordIndexingStats,
  OpenCodeIndexingStats,
  KanbanIndexingStats,
  IndexingStats,
  ContentType,
  ContentSource,
} from '@promethean-os/persistence';

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
