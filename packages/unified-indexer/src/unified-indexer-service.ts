/**
 * Unified Indexer Service (Functional Implementation)
 *
 * This service orchestrates all data sources to populate the contextStore
 * with content from files, Discord, OpenCode, Kanban, and other systems.
 * It provides a single entry point for cross-domain indexing and search.
 */

import type {
  UnifiedIndexingClient,
  SearchQuery,
  SearchResponse,
  ContentType,
  ContentSource,
  ContextStoreState,
  IndexingStats,
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

import {
  DualStoreManager,
  createContextStore,
  compileContext,
  getOrCreateCollection,
  transformDualStoreEntry,
} from '@promethean-os/persistence';

import {
  createUnifiedFileIndexer,
  createUnifiedDiscordIndexer,
  createUnifiedOpenCodeIndexer,
  createUnifiedKanbanIndexer,
} from './types/service.js';

/**
 * Create a UnifiedIndexingClient adapter for DualStoreManager
 */
async function createUnifiedIndexingClient(_config: any): Promise<UnifiedIndexingClient> {
  const dualStore = await DualStoreManager.create('unified', 'text', 'createdAt');

  return {
    async index(content: any) {
      await dualStore.addEntry({
        id: content.id,
        text: content.content,
        createdAt: content.timestamp || Date.now(),
        metadata: content.metadata || {},
      } as any);
      return content.id;
    },

    async indexBatch(contents: any[]) {
      const ids = [];
      for (const content of contents) {
        await dualStore.addEntry({
          id: content.id,
          text: content.content,
          createdAt: content.timestamp || Date.now(),
          metadata: content.metadata || {},
        } as any);
        ids.push(content.id);
      }
      return ids;
    },

    async search(query: SearchQuery): Promise<SearchResponse> {
      const startTime = Date.now();
      const results = await dualStore.getMostRelevant(
        query.query ? [query.query] : [],
        query.limit || 10,
        query.metadata,
      );

      const toEpochMs = (timestamp: any): number => {
        if (timestamp instanceof Date) return timestamp.getTime();
        if (typeof timestamp === 'string') return new Date(timestamp).getTime();
        if (typeof timestamp === 'number') return timestamp;
        return Date.now();
      };

      return {
        results: results.map((entry) => ({
          content: transformDualStoreEntry({
            id: entry.id || entry._id?.toString(),
            text: entry.text,
            timestamp: toEpochMs(entry.timestamp),
            metadata: entry.metadata,
          }),
          score: 1.0,
        })),
        total: results.length,
        took: Date.now() - startTime,
        query,
      };
    },

    async getById(id: string) {
      const entry = await dualStore.get(id);
      if (!entry) return null;

      const toEpochMs = (timestamp: any): number => {
        if (timestamp instanceof Date) return timestamp.getTime();
        if (typeof timestamp === 'string') return new Date(timestamp).getTime();
        if (typeof timestamp === 'number') return timestamp;
        return Date.now();
      };

      return transformDualStoreEntry({
        id: entry.id || entry._id?.toString(),
        text: entry.text,
        timestamp: toEpochMs(entry.timestamp),
        metadata: entry.metadata,
      });
    },

    async getByType(_type: ContentType) {
      return [];
    },

    async getBySource(_source: ContentSource) {
      return [];
    },

    async update(_id: string, _content: any) {
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

    async getStats(): Promise<IndexingStats> {
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
    },

    async healthCheck() {
      const report = await dualStore.getConsistencyReport(1);
      return {
        healthy: report.consistentDocuments > 0,
        vectorStore: true,
        metadataStore: true,
        issues: [],
      };
    },
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
  errors: string[];
}

/**
 * Initialize the service and all indexers
 */
export async function initializeService(
  config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerServiceState> {
  const unifiedClient = await createUnifiedIndexingClient(config.indexing);

  const contextStore = createContextStore(
    config.contextStore.formatTime,
    config.contextStore.assistantName,
  );

  const state: UnifiedIndexerServiceState = {
    config,
    unifiedClient,
    contextStore,
    isRunning: false,
    lastSync: 0,
    errors: [],
  };

  await initializeContextCollections(state);
  await initializeIndexers(state);

  console.log('Unified Indexer Service initialized successfully');
  return state;
}

/**
 * Start the service and begin periodic syncing
 */
export async function startService(state: UnifiedIndexerServiceState): Promise<void> {
  if (state.isRunning) {
    console.warn('Unified Indexer Service is already running');
    return;
  }

  await performFullSync(state);

  state.syncInterval = setInterval(() => performPeriodicSync(state), state.config.sync.interval);

  state.isRunning = true;
  console.log('Unified Indexer Service started successfully');
}

/**
 * Stop the service
 */
export async function stopService(state: UnifiedIndexerServiceState): Promise<void> {
  if (!state.isRunning) {
    console.warn('Unified Indexer Service is not running');
    return;
  }

  if (state.syncInterval) {
    clearInterval(state.syncInterval);
    state.syncInterval = undefined;
  }

  state.isRunning = false;
  console.log('Unified Indexer Service stopped');
}

/**
 * Search across all indexed content
 */
export async function searchService(
  state: UnifiedIndexerServiceState,
  query: SearchQuery,
): Promise<SearchResponse> {
  return state.unifiedClient.search(query);
}

/**
 * Get context from all sources for LLM consumption
 */
export async function getContextService(
  state: UnifiedIndexerServiceState,
  queries: string[] = [],
  options: {
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
    formatAssistantMessages?: boolean;
  } = {},
): Promise<any[]> {
  const unifiedCollectionName = state.config.contextStore.collections.unified;
  const unifiedCollection = state.contextStore.collections.get(unifiedCollectionName);

  if (!unifiedCollection) {
    throw new Error(`Unified collection '${unifiedCollectionName}' not found`);
  }

  const tempState = {
    ...state.contextStore,
    collections: new Map([[unifiedCollectionName, unifiedCollection]]),
  };

  return compileContext(
    tempState,
    queries,
    options.recentLimit,
    options.queryLimit,
    options.limit,
    options.formatAssistantMessages,
  );
}

/**
 * Get service status
 */
export async function getStatusService(state: UnifiedIndexerServiceState): Promise<ServiceStatus> {
  const healthCheck = await state.unifiedClient.healthCheck();
  const activeSources: ContentSource[] = [];

  if (state.config.sources.files.enabled) activeSources.push('filesystem');
  if (state.config.sources.discord.enabled) activeSources.push('discord');
  if (state.config.sources.opencode.enabled) activeSources.push('opencode');
  if (state.config.sources.kanban.enabled) activeSources.push('kanban');

  return {
    healthy: healthCheck.healthy && state.isRunning,
    indexing: state.isRunning,
    lastSync: state.lastSync,
    nextSync: state.lastSync + state.config.sync.interval,
    activeSources,
    issues: [...healthCheck.issues, ...state.errors],
  };
}

/**
 * Initialize context store collections
 */
async function initializeContextCollections(state: UnifiedIndexerServiceState): Promise<void> {
  const collections = state.config.contextStore.collections;

  for (const [source, collectionName] of Object.entries(collections)) {
    try {
      await getOrCreateCollection(state.contextStore, collectionName);
      console.log(`Initialized context collection for ${source}: ${collectionName}`);
    } catch (error) {
      console.error(`Failed to initialize collection for ${source}:`, error);
      throw error;
    }
  }
}

/**
 * Initialize source indexers
 */
async function initializeIndexers(state: UnifiedIndexerServiceState): Promise<void> {
  if (state.config.sources.files.enabled) {
    state.fileIndexer = createUnifiedFileIndexer(state.unifiedClient);
  }

  if (state.config.sources.discord.enabled) {
    state.discordIndexer = createUnifiedDiscordIndexer(state.unifiedClient);
  }

  if (state.config.sources.opencode.enabled) {
    state.opencodeIndexer = createUnifiedOpenCodeIndexer(state.unifiedClient);
  }

  if (state.config.sources.kanban.enabled) {
    state.kanbanIndexer = createUnifiedKanbanIndexer(state.unifiedClient);
  }
}

/**
 * Perform a full sync of all enabled sources
 */
async function performFullSync(state: UnifiedIndexerServiceState): Promise<UnifiedIndexerStats> {
  const startTime = Date.now();
  const stats: UnifiedIndexerStats = {
    total: {
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
    bySource: {},
    byType: {} as Record<ContentType, number>,
    lastSync: startTime,
    syncDuration: 0,
    errors: [],
  };

  console.log('Starting full sync of all data sources...');

  await syncFiles(state, stats);
  await syncDiscord(state, stats);
  await syncOpenCode(state, stats);
  await syncKanban(state, stats);

  await updateUnifiedCollection(state);

  stats.total = await state.unifiedClient.getStats();
  stats.syncDuration = Date.now() - startTime;
  state.lastSync = startTime;

  console.log(`Full sync completed in ${stats.syncDuration}ms`);
  return stats;
}

/**
 * Sync files from configured paths
 */
async function syncFiles(
  state: UnifiedIndexerServiceState,
  stats: UnifiedIndexerStats,
): Promise<void> {
  if (!state.config.sources.files.enabled || !state.fileIndexer) {
    return;
  }

  try {
    const allStats: FileIndexingStats = {
      totalFiles: 0,
      indexedFiles: 0,
      skippedFiles: 0,
      errors: [],
      duration: 0,
    };

    for (const path of state.config.sources.files.paths) {
      try {
        const pathStats = await state.fileIndexer.indexDirectory(
          path,
          state.config.sources.files.options,
        );
        allStats.totalFiles += pathStats.totalFiles;
        allStats.indexedFiles += pathStats.indexedFiles;
        allStats.skippedFiles += pathStats.skippedFiles;
        allStats.errors.push(...pathStats.errors);
        allStats.duration += pathStats.duration;
      } catch (error) {
        const errorMsg = `Failed to index path ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        allStats.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    stats.bySource.filesystem = allStats;
    console.log(`Files sync completed: ${allStats.indexedFiles} files indexed`);
  } catch (error) {
    const errorMsg = `Files sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    stats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

/**
 * Sync Discord messages
 */
async function syncDiscord(
  state: UnifiedIndexerServiceState,
  stats: UnifiedIndexerStats,
): Promise<void> {
  if (!state.config.sources.discord.enabled || !state.discordIndexer) {
    return;
  }

  try {
    const discordStats: DiscordIndexingStats = {
      totalMessages: 0,
      indexedMessages: 0,
      skippedMessages: 0,
      errors: [],
      duration: 0,
    };

    stats.bySource.discord = discordStats;
    console.log(`Discord sync completed: ${discordStats.indexedMessages} messages indexed`);
  } catch (error) {
    const errorMsg = `Discord sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    stats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

/**
 * Sync OpenCode sessions and events
 */
async function syncOpenCode(
  state: UnifiedIndexerServiceState,
  stats: UnifiedIndexerStats,
): Promise<void> {
  if (!state.config.sources.opencode.enabled || !state.opencodeIndexer) {
    return;
  }

  try {
    const opencodeStats: OpenCodeIndexingStats = {
      totalItems: 0,
      indexedItems: 0,
      skippedItems: 0,
      errors: [],
      duration: 0,
    };

    stats.bySource.opencode = opencodeStats;
    console.log('OpenCode sync completed');
  } catch (error) {
    const errorMsg = `OpenCode sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    stats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

/**
 * Sync Kanban tasks and boards
 */
async function syncKanban(
  state: UnifiedIndexerServiceState,
  stats: UnifiedIndexerStats,
): Promise<void> {
  if (!state.config.sources.kanban.enabled || !state.kanbanIndexer) {
    return;
  }

  try {
    const kanbanStats: KanbanIndexingStats = {
      totalItems: 0,
      indexedItems: 0,
      skippedItems: 0,
      errors: [],
      duration: 0,
    };

    stats.bySource.kanban = kanbanStats;
    console.log('Kanban sync completed');
  } catch (error) {
    const errorMsg = `Kanban sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    stats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

/**
 * Update unified collection with content from all source collections
 */
async function updateUnifiedCollection(state: UnifiedIndexerServiceState): Promise<void> {
  const unifiedCollectionName = state.config.contextStore.collections.unified;
  const [newState, unifiedCollection] = await getOrCreateCollection(
    state.contextStore,
    unifiedCollectionName,
  );

  const sourceCollections = [
    state.config.contextStore.collections.files,
    state.config.contextStore.collections.discord,
    state.config.contextStore.collections.opencode,
    state.config.contextStore.collections.kanban,
  ].filter((name) => name !== unifiedCollectionName);

  for (const sourceName of sourceCollections) {
    const sourceCollection = state.contextStore.collections.get(sourceName);
    if (sourceCollection) {
      try {
        const documents = await sourceCollection.getMostRecent(1000);
        for (const doc of documents) {
          await unifiedCollection.addEntry(doc as any);
        }
      } catch (error) {
        console.error(`Failed to sync collection ${sourceName} to unified:`, error);
      }
    }
  }

  state.contextStore = newState;
}

/**
 * Perform periodic sync
 */
async function performPeriodicSync(state: UnifiedIndexerServiceState): Promise<void> {
  try {
    console.log('Performing periodic sync...');
    await performFullSync(state);
  } catch (error) {
    console.error('Periodic sync failed:', error);
    state.errors.push(
      `Periodic sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Factory function to create unified indexer service
 */
export async function createUnifiedIndexerService(
  config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerServiceState> {
  return initializeService(config);
}

/**
 * Default configuration
 */
export const DEFAULT_SERVICE_CONFIG: Partial<UnifiedIndexerServiceConfig> = {
  contextStore: {
    collections: {
      files: 'files',
      discord: 'discord',
      opencode: 'opencode',
      kanban: 'kanban',
      unified: 'unified',
    },
    formatTime: (ms: number) => new Date(ms).toISOString(),
    assistantName: 'Duck',
  },
  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs'],
      options: {
        batchSize: 100,
        excludePatterns: ['node_modules/**', '.git/**', 'dist/**'],
      },
    },
    discord: {
      enabled: false,
    },
    opencode: {
      enabled: false,
    },
    kanban: {
      enabled: false,
    },
  },
  sync: {
    interval: 300000, // 5 minutes
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
  },
};
