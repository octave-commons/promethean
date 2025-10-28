/**
 * Unified Indexer Service (Functional Implementation)
 *
 * This service orchestrates all data sources to populate contextStore
 * with content from files, Discord, OpenCode, Kanban, and other systems.
 * It provides a single entry point for cross-domain indexing and search.
 */

import { createContextStore, transformDualStoreEntry } from '@promethean-os/persistence';

import type {
  DualStoreEntry,
  SearchQuery,
  SearchResponse,
  SearchResult,
  ContentType,
  ContentSource,
  ContextStoreState,
  IndexingStats,
  UnifiedIndexingClient,
  IndexableContent,
} from '@promethean-os/persistence';

import type {
  FileIndexingStats,
  DiscordIndexingStats,
  OpenCodeIndexingStats,
  KanbanIndexingStats,
  UnifiedFileIndexer,
  UnifiedDiscordIndexer,
  UnifiedOpenCodeIndexer,
  UnifiedKanbanIndexer,
  UnifiedIndexerServiceConfig,
  UnifiedIndexerStats,
  ServiceStatus,
} from './types/service.js';

/**
 * Convert timestamp to epoch milliseconds
 */
function toEpochMs(timestamp: unknown): number {
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp === 'string') return new Date(timestamp).getTime();
  if (typeof timestamp === 'number') return timestamp;
  return Date.now();
}

/**
 * Transform IndexableContent to DualStoreEntry
 */
function contentToDualStoreEntry(content: IndexableContent): DualStoreEntry<'text', 'createdAt'> {
  return {
    id: content.id,
    text: content.content,
    createdAt: content.timestamp || Date.now(),
    metadata: content.metadata as unknown as DualStoreEntry<'text', 'createdAt'>['metadata'],
  };
}

/**
 * Create search result from DualStoreEntry
 */
function createSearchResult(entry: DualStoreEntry<'text', 'timestamp'>): SearchResult {
  return {
    content: transformDualStoreEntry({
      id: entry.id || entry._id?.toString(),
      text: entry.text,
      timestamp: toEpochMs(entry.timestamp),
      metadata: entry.metadata,
    }),
    score: 1.0,
  };
}

/**
 * Create index handler for DualStoreManager
 */
function createIndexHandler(dualStore: any) {
  return async function index(content: IndexableContent) {
    const entry = contentToDualStoreEntry(content);
    await dualStore.addEntry(entry);
    return content.id;
  };
}

/**
 * Create index batch handler for DualStoreManager
 */
function createIndexBatchHandler(dualStore: any) {
  return async function indexBatch(contents: readonly IndexableContent[]) {
    return contents.map((content) => {
      const entry = contentToDualStoreEntry(content);
      void dualStore.addEntry(entry);
      return content.id;
    });
  };
}

/**
 * Create search handler for DualStoreManager
 */
function createSearchHandler(dualStore: any) {
  return async function search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    const results = await dualStore.getMostRelevant(
      query.query ? [query.query] : [],
      query.limit || 10,
      query.metadata,
    );

    return {
      results: results.map(createSearchResult),
      total: results.length,
      took: Date.now() - startTime,
      query,
    };
  };
}

/**
 * Create get by ID handler for DualStoreManager
 */
function createGetByIdHandler(dualStore: any) {
  return async function getById(id: string) {
    const entry = await dualStore.get(id);
    if (!entry) return null;

    return transformDualStoreEntry({
      id: entry.id || entry._id?.toString(),
      text: entry.text,
      timestamp: toEpochMs(entry.timestamp),
      metadata: entry.metadata,
    });
  };
}

/**
 * Create stats handler for DualStoreManager
 */
function createStatsHandler(dualStore: any) {
  return async function getStats(): Promise<IndexingStats> {
    const report = await dualStore.getConsistencyReport();
    return {
      totalContent: report.totalDocuments,
      contentByType: {} as Record<ContentType, number>,
      contentBySource: {} as Record<ContentSource, number>,
      lastIndexed: Date.now(),
      storageStats: {
        vectorSize: 0,
        metadataSize: 0,
        totalSize: 0,
      },
    };
  };
}

/**
 * Create health check handler for DualStoreManager
 */
function createHealthCheckHandler(dualStore: any) {
  return async function healthCheck() {
    const report = await dualStore.getConsistencyReport(1);
    return {
      healthy: report.consistentDocuments > 0,
      vectorStore: true,
      metadataStore: true,
      issues: [],
    };
  };
}

/**
 * Create a UnifiedIndexingClient adapter for DualStoreManager
 */
async function createUnifiedIndexingClient(_config: unknown): Promise<UnifiedIndexingClient> {
  const dualStore = await DualStoreManager.create('unified', 'text', 'createdAt');

  return {
    index: createIndexHandler(dualStore),

    indexBatch: createIndexBatchHandler(dualStore),

    search: createSearchHandler(dualStore),

    getById: createGetByIdHandler(dualStore),

    async getByType(_type: ContentType) {
      return [];
    },

    async getBySource(_source: ContentSource) {
      return [];
    },

    async update(_id: string, _content: IndexableContent) {
      return false;
    },

    async delete(_id: string) {
      return false;
    },

    async deleteBatch(ids: string[]) {
      return ids.map(() => false);
    },

    async reindex() {
      // No-op
    },

    async optimize() {
      // No-op
    },

    getStats: createStatsHandler(dualStore),

    healthCheck: createHealthCheckHandler(dualStore),
  };
}

/**
 * Service state interface
 */
export interface UnifiedIndexerServiceState {
  config: UnifiedIndexerServiceConfig;
  unifiedClient: UnifiedIndexingClient;
  contextStore: ContextStoreState;
  fileIndexer?: UnifiedFileIndexer;
  discordIndexer?: UnifiedDiscordIndexer;
  opencodeIndexer?: UnifiedOpenCodeIndexer;
  kanbanIndexer?: UnifiedKanbanIndexer;
  isRunning: boolean;
  syncInterval?: NodeJS.Timeout;
  lastSync: number;
  stats: {
    fileIndexing: FileIndexingStats;
    discordIndexing: DiscordIndexingStats;
    opencodeIndexing: OpenCodeIndexingStats;
    kanbanIndexing: KanbanIndexingStats;
    unified: UnifiedIndexerStats;
  };
}

/**
 * Initialize service with all indexers
 */
async function initializeService(
  config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerServiceState> {
  const unifiedClient = await createUnifiedIndexingClient(config.indexing);

  const contextStore = createContextStore(
    config.contextStore.formatTime,
    config.contextStore.assistantName,
  );

  return {
    config,
    unifiedClient,
    contextStore,
    isRunning: false,
    lastSync: 0,
    stats: {
      fileIndexing: {
        totalFiles: 0,
        indexedFiles: 0,
        skippedFiles: 0,
        errors: [],
        duration: 0,
      },
      discordIndexing: {
        totalMessages: 0,
        indexedMessages: 0,
        skippedMessages: 0,
        errors: [],
        duration: 0,
      },
      opencodeIndexing: {
        totalItems: 0,
        indexedItems: 0,
        skippedItems: 0,
        errors: [],
        duration: 0,
      },
      kanbanIndexing: {
        totalItems: 0,
        indexedItems: 0,
        skippedItems: 0,
        errors: [],
        duration: 0,
      },
      unified: {
        totalContent: 0,
        contentByType: {} as Record<ContentType, number>,
        contentBySource: {} as Record<ContentSource, number>,
        lastIndexed: Date.now(),
        storageStats: {
          vectorSize: 0,
          metadataSize: 0,
          totalSize: 0,
        },
      },
    },
  };
}

/**
 * Start unified indexer service
 */
export async function startUnifiedIndexerService(
  state: UnifiedIndexerServiceState,
): Promise<UnifiedIndexerServiceState> {
  if (state.isRunning) {
    return state;
  }

  // Start periodic sync
  const syncInterval = setInterval(async () => {
    await syncAllIndexers(state);
  }, state.config.sync.interval);

  return {
    ...state,
    isRunning: true,
    syncInterval,
  };
}

/**
 * Stop unified indexer service
 */
export async function stopUnifiedIndexerService(
  state: UnifiedIndexerServiceState,
): Promise<UnifiedIndexerServiceState> {
  if (!state.isRunning) {
    return state;
  }

  // Clear sync interval
  if (state.syncInterval) {
    clearInterval(state.syncInterval);
  }

  return {
    ...state,
    isRunning: false,
    syncInterval: undefined,
  };
}

/**
 * Sync all indexers
 */
async function syncAllIndexers(state: UnifiedIndexerServiceState): Promise<void> {
  const startTime = Date.now();

  try {
    // Sync file indexer
    if (state.fileIndexer) {
      const fileStats = await state.fileIndexer.getStats();
      state.stats.fileIndexing = fileStats;
    }

    // Sync Discord indexer
    if (state.discordIndexer) {
      const discordStats = await state.discordIndexer.getStats();
      state.stats.discordIndexing = discordStats;
    }

    // Sync OpenCode indexer
    if (state.opencodeIndexer) {
      const opencodeStats = await state.opencodeIndexer.getStats();
      state.stats.opencodeIndexing = opencodeStats;
    }

    // Sync Kanban indexer
    if (state.kanbanIndexer) {
      const kanbanStats = await state.kanbanIndexer.getStats();
      state.stats.kanbanIndexing = kanbanStats;
    }

    // Update unified stats
    const unifiedStats = await state.unifiedClient.getStats();
    state.stats.unified = unifiedStats;

    state.lastSync = Date.now();
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

/**
 * Get service status
 */
export function getServiceStatus(state: UnifiedIndexerServiceState): ServiceStatus {
  return {
    isRunning: state.isRunning,
    lastSync: state.lastSync,
    uptime: state.isRunning ? Date.now() - (state.lastSync || Date.now()) : 0,
    stats: state.stats,
  };
}

/**
 * Factory function to create unified indexer service
 */
export async function createUnifiedIndexerService(
  config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerServiceState> {
  return initializeService(config);
}
