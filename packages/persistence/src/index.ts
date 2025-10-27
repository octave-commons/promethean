export * from './clients.js';
export * from './types.js';
export * from './dualStore.js';
export * from './contextStore.js';
export * from './maintenance.js';
export * from './unified-content-model.js';
export type {
    UnifiedIndexingClient,
    UnifiedIndexingConfig,
    SearchQuery,
    SearchResponse,
    SearchResult,
    IndexingStats,
    IndexingOptions,
} from './unified-indexing-api.js';
export {
    createUnifiedIndexingClient,
    DEFAULT_CONFIG as UNIFIED_INDEXING_DEFAULT_CONFIG,
} from './unified-indexing-client.js';

// Migration adapters
export {
    UnifiedFileIndexer,
    createUnifiedFileIndexer,
    type FileIndexingOptions,
    type FileIndexingStats,
    type FileIndexEntry,
    type FileSearchResult,
} from './file-system-migration-adapter.js';

export {
    UnifiedDiscordIndexer,
    createUnifiedDiscordIndexer,
    type DiscordMessageEvent,
    type DiscordIndexingStats,
} from './discord-migration-adapter.js';

export {
    UnifiedOpenCodeIndexer,
    createUnifiedOpenCodeIndexer,
    type OpenCodeSession,
    type OpenCodeEvent,
    type OpenCodeMessage,
    type OpenCodeIndexingStats,
} from './opencode-migration-adapter.js';

export {
    UnifiedKanbanIndexer,
    createUnifiedKanbanIndexer,
    type KanbanTask,
    type KanbanBoard,
    type KanbanIndexingStats,
} from './kanban-migration-adapter.js';

// Unified indexer service
export {
    UnifiedIndexerService,
    createUnifiedIndexerService,
    DEFAULT_SERVICE_CONFIG,
    type UnifiedIndexerServiceConfig,
    type UnifiedIndexerStats,
    type ServiceStatus,
} from './unified-indexer-service.js';
