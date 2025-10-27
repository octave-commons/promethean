/**
 * Unified Indexer Service
 *
 * This service orchestrates all data sources to populate the contextStore
 * with content from files, Discord, OpenCode, Kanban, and other systems.
 * It provides a single entry point for cross-domain indexing and search.
 */

import type {
  UnifiedIndexingClient,
  UnifiedIndexingConfig,
  SearchQuery,
  SearchResponse,
  IndexingStats,
  ContentType,
  ContentSource,
  FileIndexingOptions,
  FileIndexingStats,
  DiscordIndexingStats,
  OpenCodeIndexingStats,
  KanbanIndexingStats,
} from '@promethean-os/persistence';

import type {
  UnifiedIndexerServiceConfig,
  UnifiedIndexerStats,
  ServiceStatus,
} from './types/service.js';

import {
  createUnifiedIndexingClient,
  createUnifiedFileIndexer,
  createUnifiedDiscordIndexer,
  createUnifiedOpenCodeIndexer,
  createUnifiedKanbanIndexer,
} from '@promethean-os/persistence';

import type {
  UnifiedFileIndexer,
  FileIndexingOptions,
  FileIndexingStats,
} from '@promethean-os/persistence';

import type { UnifiedDiscordIndexer, DiscordIndexingStats } from '@promethean-os/persistence';

import type { UnifiedOpenCodeIndexer, OpenCodeIndexingStats } from '@promethean-os/persistence';

import type { UnifiedKanbanIndexer, KanbanIndexingStats } from '@promethean-os/persistence';

import type { ContextStoreState } from '@promethean-os/persistence';
import {
  createContextStore,
  compileContext,
  getOrCreateCollection,
} from '@promethean-os/persistence';

/**
 * Unified Indexer Service
 *
 * This service provides a single interface for indexing content from multiple
 * sources and making it available through the contextStore for cross-domain search.
 */
export class UnifiedIndexerService {
  private config: UnifiedIndexerServiceConfig;
  private unifiedClient!: UnifiedIndexingClient;
  private contextStore!: ContextStoreState;

  // Indexers for each source
  private fileIndexer?: UnifiedFileIndexer;
  private discordIndexer?: UnifiedDiscordIndexer;
  private opencodeIndexer?: UnifiedOpenCodeIndexer;
  private kanbanIndexer?: UnifiedKanbanIndexer;

  // Service state
  private isRunning = false;
  private syncInterval?: NodeJS.Timeout;
  private lastSync = 0;
  private errors: string[] = [];

  constructor(config: UnifiedIndexerServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the service and all indexers
   */
  async initialize(): Promise<void> {
    try {
      // Initialize unified indexing client
      this.unifiedClient = await createUnifiedIndexingClient(this.config.indexing);

      // Initialize context store
      this.contextStore = createContextStore(
        this.config.contextStore.formatTime,
        this.config.contextStore.assistantName,
      );

      // Initialize collections in context store
      await this.initializeContextCollections();

      // Initialize source indexers
      await this.initializeIndexers();

      console.log('Unified Indexer Service initialized successfully');
    } catch (error) {
      throw new Error(
        `Failed to initialize Unified Indexer Service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Start the service and begin periodic syncing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Unified Indexer Service is already running');
      return;
    }

    try {
      // Perform initial sync
      await this.performFullSync();

      // Start periodic sync
      this.syncInterval = setInterval(() => this.performPeriodicSync(), this.config.sync.interval);

      this.isRunning = true;
      console.log('Unified Indexer Service started successfully');
    } catch (error) {
      throw new Error(
        `Failed to start Unified Indexer Service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('Unified Indexer Service is not running');
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }

    this.isRunning = false;
    console.log('Unified Indexer Service stopped');
  }

  /**
   * Perform a full sync of all enabled sources
   */
  async performFullSync(): Promise<UnifiedIndexerStats> {
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

    try {
      console.log('Starting full sync of all data sources...');

      // Sync files
      if (this.config.sources.files.enabled && this.fileIndexer) {
        try {
          const fileStats = await this.syncFiles();
          stats.bySource.filesystem = fileStats;
          console.log(`Files sync completed: ${fileStats.indexedFiles} files indexed`);
        } catch (error) {
          const errorMsg = `Files sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Sync Discord
      if (this.config.sources.discord.enabled && this.discordIndexer) {
        try {
          const discordStats = await this.syncDiscord();
          stats.bySource.discord = discordStats;
          console.log(`Discord sync completed: ${discordStats.indexedMessages} messages indexed`);
        } catch (error) {
          const errorMsg = `Discord sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Sync OpenCode
      if (this.config.sources.opencode.enabled && this.opencodeIndexer) {
        try {
          const opencodeStats = await this.syncOpenCode();
          stats.bySource.opencode = opencodeStats;
          console.log(`OpenCode sync completed`);
        } catch (error) {
          const errorMsg = `OpenCode sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Sync Kanban
      if (this.config.sources.kanban.enabled && this.kanbanIndexer) {
        try {
          const kanbanStats = await this.syncKanban();
          stats.bySource.kanban = kanbanStats;
          console.log(`Kanban sync completed`);
        } catch (error) {
          const errorMsg = `Kanban sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Update unified collection with all content
      await this.updateUnifiedCollection();

      // Get final stats
      stats.total = await this.unifiedClient.getStats();
      stats.syncDuration = Date.now() - startTime;
      this.lastSync = startTime;

      console.log(`Full sync completed in ${stats.syncDuration}ms`);
      return stats;
    } catch (error) {
      stats.errors.push(
        `Full sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      stats.syncDuration = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * Search across all indexed content
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    return this.unifiedClient.search(query);
  }

  /**
   * Get context from all sources for LLM consumption
   */
  async getContext(
    queries: string[] = [],
    options: {
      recentLimit?: number;
      queryLimit?: number;
      limit?: number;
      formatAssistantMessages?: boolean;
    } = {},
  ): Promise<any[]> {
    // Use the unified collection for context compilation
    const unifiedCollectionName = this.config.contextStore.collections.unified;
    const unifiedCollection = this.contextStore.collections.get(unifiedCollectionName);

    if (!unifiedCollection) {
      throw new Error(`Unified collection '${unifiedCollectionName}' not found`);
    }

    // Create a temporary context store state with only the unified collection
    const tempState = {
      ...this.contextStore,
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
  async getStatus(): Promise<ServiceStatus> {
    const healthCheck = await this.unifiedClient.healthCheck();
    const activeSources: ContentSource[] = [];

    if (this.config.sources.files.enabled) activeSources.push('filesystem');
    if (this.config.sources.discord.enabled) activeSources.push('discord');
    if (this.config.sources.opencode.enabled) activeSources.push('opencode');
    if (this.config.sources.kanban.enabled) activeSources.push('kanban');

    return {
      healthy: healthCheck.healthy && this.isRunning,
      indexing: this.isRunning,
      lastSync: this.lastSync,
      nextSync: this.lastSync + this.config.sync.interval,
      activeSources,
      issues: [...healthCheck.issues, ...this.errors],
    };
  }

  /**
   * Get comprehensive statistics
   */
  async getStats(): Promise<UnifiedIndexerStats> {
    const totalStats = await this.unifiedClient.getStats();

    return {
      total: totalStats,
      bySource: {},
      byType: totalStats.contentByType,
      lastSync: this.lastSync,
      syncDuration: 0,
      errors: [...this.errors],
    };
  }

  /**
   * Initialize context store collections
   */
  private async initializeContextCollections(): Promise<void> {
    const collections = this.config.contextStore.collections;

    for (const [source, collectionName] of Object.entries(collections)) {
      try {
        await getOrCreateCollection(this.contextStore, collectionName);
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
  private async initializeIndexers(): Promise<void> {
    // Initialize file indexer
    if (this.config.sources.files.enabled) {
      this.fileIndexer = createUnifiedFileIndexer(this.unifiedClient);
    }

    // Initialize Discord indexer
    if (this.config.sources.discord.enabled) {
      this.discordIndexer = createUnifiedDiscordIndexer(this.unifiedClient);
    }

    // Initialize OpenCode indexer
    if (this.config.sources.opencode.enabled) {
      this.opencodeIndexer = createUnifiedOpenCodeIndexer(this.unifiedClient);
    }

    // Initialize Kanban indexer
    if (this.config.sources.kanban.enabled) {
      this.kanbanIndexer = createUnifiedKanbanIndexer(this.unifiedClient);
    }
  }

  /**
   * Sync files from configured paths
   */
  private async syncFiles(): Promise<FileIndexingStats> {
    if (!this.fileIndexer) {
      throw new Error('File indexer not initialized');
    }

    const allStats: FileIndexingStats = {
      totalFiles: 0,
      indexedFiles: 0,
      skippedFiles: 0,
      errors: [],
      duration: 0,
    };

    for (const path of this.config.sources.files.paths) {
      try {
        const stats = await this.fileIndexer.indexDirectory(
          path,
          this.config.sources.files.options,
        );
        allStats.totalFiles += stats.totalFiles;
        allStats.indexedFiles += stats.indexedFiles;
        allStats.skippedFiles += stats.skippedFiles;
        allStats.errors.push(...stats.errors);
        allStats.duration += stats.duration;
      } catch (error) {
        const errorMsg = `Failed to index path ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        allStats.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return allStats;
  }

  /**
   * Sync Discord messages
   */
  private async syncDiscord(): Promise<DiscordIndexingStats> {
    if (!this.discordIndexer) {
      throw new Error('Discord indexer not initialized');
    }

    // This would typically involve fetching messages from Discord API
    // For now, return empty stats
    return {
      totalMessages: 0,
      indexedMessages: 0,
      skippedMessages: 0,
      errors: [],
      duration: 0,
    };
  }

  /**
   * Sync OpenCode sessions and events
   */
  private async syncOpenCode(): Promise<OpenCodeIndexingStats> {
    if (!this.opencodeIndexer) {
      throw new Error('OpenCode indexer not initialized');
    }

    // This would typically involve fetching sessions/events from OpenCode
    // For now, return empty stats
    return {
      totalItems: 0,
      indexedItems: 0,
      skippedItems: 0,
      errors: [],
      duration: 0,
    };
  }

  /**
   * Sync Kanban tasks and boards
   */
  private async syncKanban(): Promise<KanbanIndexingStats> {
    if (!this.kanbanIndexer) {
      throw new Error('Kanban indexer not initialized');
    }

    // This would typically involve fetching tasks/boards from Kanban system
    // For now, return empty stats
    return {
      totalItems: 0,
      indexedItems: 0,
      skippedItems: 0,
      errors: [],
      duration: 0,
    };
  }

  /**
   * Update unified collection with content from all source collections
   */
  private async updateUnifiedCollection(): Promise<void> {
    const unifiedCollectionName = this.config.contextStore.collections.unified;
    const [newState, unifiedCollection] = await getOrCreateCollection(
      this.contextStore,
      unifiedCollectionName,
    );

    // Get content from all source collections and add to unified collection
    const sourceCollections = [
      this.config.contextStore.collections.files,
      this.config.contextStore.collections.discord,
      this.config.contextStore.collections.opencode,
      this.config.contextStore.collections.kanban,
    ].filter((name) => name !== unifiedCollectionName);

    for (const sourceName of sourceCollections) {
      const sourceCollection = this.contextStore.collections.get(sourceName);
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

    // Update context store state
    this.contextStore = newState;
  }

  /**
   * Perform periodic sync
   */
  private async performPeriodicSync(): Promise<void> {
    try {
      console.log('Performing periodic sync...');
      await this.performFullSync();
    } catch (error) {
      console.error('Periodic sync failed:', error);
      this.errors.push(
        `Periodic sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

/**
 * Factory function to create unified indexer service
 */
export async function createUnifiedIndexerService(
  config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerService> {
  const service = new UnifiedIndexerService(config);
  await service.initialize();
  return service;
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
