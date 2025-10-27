# Unified Indexer Service - API Reference

## Table of Contents

-   [UnifiedIndexerService](#unifiedindexerservice)
-   [CrossDomainSearchEngine](#crossdomainsearchengine)
-   [Configuration Interfaces](#configuration-interfaces)
-   [Data Models](#data-models)
-   [Migration Adapters](#migration-adapters)
-   [ContextStore Integration](#contextstore-integration)

---

## UnifiedIndexerService

Main orchestrator for unified indexing and search across all data sources.

### Constructor

```typescript
constructor(config: UnifiedIndexerServiceConfig)
```

**Parameters**:

-   `config` - Configuration object defining all service behavior

**Example**:

```typescript
const service = new UnifiedIndexerService({
    indexing: {
        /* storage config */
    },
    sources: {
        /* data source config */
    },
    sync: {
        /* sync behavior */
    },
});
```

### Methods

#### initialize()

```typescript
async initialize(): Promise<void>
```

**Description**: Initializes the service and all configured indexers.

**Throws**: `Error` if initialization fails

**Example**:

```typescript
await service.initialize();
console.log('Service initialized successfully');
```

#### start()

```typescript
async start(): Promise<void>
```

**Description**: Starts the service and begins periodic synchronization.

**Behavior**:

-   Performs initial full sync
-   Starts periodic sync based on configured interval
-   Sets service state to running

**Example**:

```typescript
await service.start();
console.log('Service started with periodic sync');
```

#### stop()

```typescript
async stop(): Promise<void>
```

**Description**: Stops the service and cancels periodic synchronization.

**Example**:

```typescript
await service.stop();
console.log('Service stopped gracefully');
```

#### search()

```typescript
async search(query: SearchQuery): Promise<SearchResponse>
```

**Parameters**:

-   `query` - Search configuration including query text, filters, and options

**Returns**: Promise resolving to search response with results and metadata

**Example**:

```typescript
const results = await service.search({
    query: 'TypeScript contextStore',
    type: ['file', 'document'],
    limit: 20,
    semantic: true,
});

console.log(`Found ${results.results.length} results in ${results.took}ms`);
```

#### getContext()

```typescript
async getContext(
    queries: string[] = [],
    options: {
        recentLimit?: number;
        queryLimit?: number;
        limit?: number;
        formatAssistantMessages?: boolean;
    } = {}
): Promise<ContextMessage[]>
```

**Parameters**:

-   `queries` - Array of query strings for context compilation
-   `options` - Context compilation options

**Returns**: Promise resolving to array of formatted context messages

**Example**:

```typescript
const context = await service.getContext(['unified indexer', 'contextStore'], {
    recentLimit: 10,
    queryLimit: 5,
    limit: 15,
    formatAssistantMessages: true,
});

console.log(`Compiled ${context.length} context messages for LLM`);
```

#### getStatus()

```typescript
async getStatus(): Promise<ServiceStatus>
```

**Returns**: Promise resolving to current service status

**Example**:

```typescript
const status = await service.getStatus();
console.log({
    healthy: status.healthy,
    indexing: status.indexing,
    activeSources: status.activeSources,
    lastSync: new Date(status.lastSync),
});
```

#### getStats()

```typescript
async getStats(): Promise<UnifiedIndexerStats>
```

**Returns**: Promise resolving to comprehensive service statistics

**Example**:

```typescript
const stats = await service.getStats();
console.log({
    totalContent: stats.total.totalContent,
    contentByType: stats.total.contentByType,
    lastSync: new Date(stats.lastSync),
});
```

---

## CrossDomainSearchEngine

Advanced search engine with intelligent ranking and analytics.

### Constructor

```typescript
constructor(indexerService: UnifiedIndexerService, defaultOptions?: Partial<CrossDomainSearchOptions>)
```

**Parameters**:

-   `indexerService` - Unified indexer service instance
-   `defaultOptions` - Default search options to apply to all queries

### Factory Function

```typescript
function createCrossDomainSearchEngine(
    indexerService: UnifiedIndexerService,
    defaultOptions?: Partial<CrossDomainSearchOptions>,
): CrossDomainSearchEngine;
```

**Example**:

```typescript
const searchEngine = createCrossDomainSearchEngine(service, {
    semantic: true,
    timeBoost: true,
    sourceWeights: {
        filesystem: 1.2,
        discord: 1.0,
    },
});
```

### Methods

#### search()

```typescript
async search(query: CrossDomainSearchOptions): Promise<CrossDomainSearchResponse>
```

**Parameters**:

-   `query` - Enhanced search options with weighting, filtering, and analytics

**Returns**: Promise resolving to enhanced search response with analytics

**Example**:

```typescript
const results = await searchEngine.search({
    query: 'unified indexer implementation',
    type: ['file', 'document'],
    limit: 20,
    semantic: true,
    hybridSearch: true,
    timeBoost: true,
    includeContext: true,
    explainScores: true,
    includeAnalytics: true,
});

console.log('Search Results:', results.results);
console.log('Analytics:', results.analytics);
console.log('Context:', results.context);
```

#### intelligentSearch()

```typescript
async intelligentSearch(query: string, options?: Partial<CrossDomainSearchOptions>): Promise<CrossDomainSearchResponse>
```

**Description**: Performs search with automatic query expansion and optimization.

**Example**:

```typescript
const results = await searchEngine.intelligentSearch('contextStore unified indexing', {
    semantic: true,
    includeAnalytics: true,
});
```

#### getContextualSearch()

```typescript
async getContextualSearch(
    queries: string[],
    options?: Partial<CrossDomainSearchOptions>
): Promise<{
    searchResults: CrossDomainSearchResponse;
    context: ContextMessage[];
}>
```

**Description**: Performs search and automatically compiles LLM context.

**Example**:

```typescript
const { searchResults, context } = await searchEngine.getContextualSearch(['unified indexer', 'cross-domain search'], {
    limit: 15,
    includeContext: true,
});

console.log(`Found ${searchResults.results.length} results`);
console.log(`Compiled ${context.length} context messages`);
```

---

## Configuration Interfaces

### UnifiedIndexerServiceConfig

```typescript
interface UnifiedIndexerServiceConfig {
    // Storage configuration
    indexing: {
        vectorStore: {
            type: 'chromadb' | 'pinecone' | 'weaviate' | 'qdrant';
            connectionString: string;
            indexName?: string;
            dimensions?: number;
        };
        metadataStore: {
            type: 'sqlite' | 'postgresql' | 'mongodb';
            connectionString: string;
            tableName?: string;
        };
        embedding: {
            model: string;
            dimensions: number;
            batchSize: number;
        };
        cache: {
            enabled: boolean;
            ttl: number;
            maxSize: number;
        };
        validation: {
            strict: boolean;
            skipVectorValidation: boolean;
            maxContentLength: number;
        };
    };

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

    // Data source configuration
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
```

### CrossDomainSearchOptions

```typescript
interface CrossDomainSearchOptions extends SearchQuery {
    // Context compilation options
    includeContext?: boolean;
    contextLimit?: number;
    formatForLLM?: boolean;

    // Source weighting
    sourceWeights?: Record<ContentSource, number>;
    typeWeights?: Record<ContentType, number>;

    // Temporal filtering
    timeBoost?: boolean;
    recencyDecay?: number; // Hours for decay

    // Semantic search options
    semanticThreshold?: number;
    hybridSearch?: boolean;
    keywordWeight?: number; // 0-1

    // Result processing
    deduplicate?: boolean;
    groupBySource?: boolean;
    maxResultsPerSource?: number;

    // Analytics
    includeAnalytics?: boolean;
    explainScores?: boolean;
}
```

### FileIndexingOptions

```typescript
interface FileIndexingOptions {
    batchSize?: number;
    excludePatterns?: string[];
    includePatterns?: string[];
    followSymlinks?: boolean;
    maxDepth?: number;
}
```

---

## Data Models

### IndexableContent

```typescript
interface IndexableContent {
    // Core identification
    id: string;
    type: ContentType;
    source: ContentSource;

    // Content data
    content: string;

    // Metadata (typed based on content type)
    metadata: ContentMetadata;

    // Timestamps
    timestamp: number;
    created_at?: number;
    updated_at?: number;

    // Optional attachments
    attachments?: AttachmentMetadata[];

    // Vector embedding information
    embedding?: {
        model: string;
        dimensions?: number;
        vector_id?: string;
    };
}
```

### ContentType

```typescript
type ContentType = 'file' | 'message' | 'event' | 'session' | 'attachment' | 'thought' | 'document' | 'task' | 'board';
```

### ContentSource

```typescript
type ContentSource = 'filesystem' | 'discord' | 'opencode' | 'agent' | 'user' | 'system' | 'external' | 'kanban';
```

### EnhancedSearchResult

```typescript
interface EnhancedSearchResult extends SearchResult {
    // Source information
    sourceType: ContentSource;
    contentType: ContentType;

    // Temporal information
    age: number; // milliseconds since creation
    recencyScore: number; // 0-1 based on age

    // Context information
    context?: ContextMessage[];
    contextRelevance?: number; // 0-1 relevance to query

    // Analytics
    scoreBreakdown?: {
        semantic: number;
        keyword: number;
        temporal: number;
        source: number;
        type: number;
        final: number;
    };

    // Explanation
    explanation?: string;
}
```

### CrossDomainSearchResponse

```typescript
interface CrossDomainSearchResponse {
    results: EnhancedSearchResult[];
    total: number;
    took: number; // milliseconds
    query: CrossDomainSearchOptions;

    // Analytics
    analytics?: {
        sourcesSearched: ContentSource[];
        typesFound: ContentType[];
        averageScore: number;
        scoreDistribution: Record<string, number>;
        temporalRange: {
            oldest: number;
            newest: number;
            span: number; // milliseconds
        };
    };

    // Context
    context?: ContextMessage[];
}
```

---

## Migration Adapters

### UnifiedFileIndexer

```typescript
class UnifiedFileIndexer {
    constructor(unifiedClient: UnifiedIndexingClient);

    async indexDirectory(directoryPath: string, options?: FileIndexingOptions): Promise<FileIndexingStats>;
    async indexFile(filePath: string, options?: FileIndexingOptions): Promise<FileIndexEntry>;
}
```

### UnifiedDiscordIndexer

```typescript
class UnifiedDiscordIndexer {
    constructor(unifiedClient: UnifiedIndexingClient);

    async handleSocialMessageCreated(evt: DiscordMessageEvent): Promise<void>;
    async indexMessage(message: DiscordMessageEvent): Promise<void>;
}
```

### UnifiedOpenCodeIndexer

```typescript
class UnifiedOpenCodeIndexer {
    constructor(unifiedClient: UnifiedIndexingClient);

    async indexSession(session: OpenCodeSession): Promise<void>;
    async indexEvent(event: OpenCodeEvent): Promise<void>;
    async indexMessage(message: OpenCodeMessage): Promise<void>;
}
```

### UnifiedKanbanIndexer

```typescript
class UnifiedKanbanIndexer {
    constructor(unifiedClient: UnifiedIndexingClient);

    async indexTask(task: KanbanTask): Promise<void>;
    async indexBoard(board: KanbanBoard): Promise<void>;
}
```

---

## ContextStore Integration

### ContextMessage

```typescript
interface ContextMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    images?: string[];
}
```

### Integration Pattern

```typescript
// Existing contextStore usage (unchanged)
import { createContextStore, compileContext } from '@promethean-os/persistence';

// New unified approach (compatible)
const context = await indexerService.getContext(['query'], options);
// context is identical format as compileContext() result
```

### Collection Management

```typescript
// Unified service creates these collections:
const collections = {
    files: 'files', // File system content
    discord: 'discord', // Discord messages
    opencode: 'opencode', // OpenCode sessions/events
    kanban: 'kanban', // Kanban tasks/boards
    unified: 'unified', // All sources combined
};
```

---

## Usage Examples

### Basic Setup

```typescript
import { createUnifiedIndexerService, createCrossDomainSearchEngine } from '@promethean-os/persistence';

// Create service
const config = {
    indexing: {
        vectorStore: {
            type: 'chromadb',
            connectionString: 'http://localhost:8000',
            indexName: 'promethean-unified',
        },
        metadataStore: {
            type: 'mongodb',
            connectionString: 'mongodb://localhost:27017',
        },
    },
    sources: {
        files: {
            enabled: true,
            paths: ['./src', './docs'],
        },
    },
    sync: {
        interval: 300000, // 5 minutes
    },
};

const indexerService = await createUnifiedIndexerService(config);
await indexerService.start();
```

### Advanced Search

```typescript
// Create search engine
const searchEngine = createCrossDomainSearchEngine(indexerService, {
    semantic: true,
    timeBoost: true,
    sourceWeights: {
        filesystem: 1.2,
        discord: 1.0,
    },
});

// Perform search
const results = await searchEngine.search({
    query: 'unified indexer service',
    type: ['file', 'document'],
    limit: 20,
    includeContext: true,
    explainScores: true,
    includeAnalytics: true,
});

console.log('Results:', results.results);
console.log('Analytics:', results.analytics);
```

### Context Compilation

```typescript
// Get LLM-ready context
const context = await indexerService.getContext(['unified indexer', 'contextStore integration'], {
    recentLimit: 10,
    queryLimit: 5,
    limit: 15,
    formatAssistantMessages: true,
});

// Use with LLM
for (const message of context) {
    console.log(`[${message.role}]: ${message.content}`);
}
```

---

## Error Handling

### Common Error Types

```typescript
// Configuration errors
class ConfigurationError extends Error {
    constructor(
        message: string,
        public field: string,
    ) {
        super(message);
    }
}

// Indexing errors
class IndexingError extends Error {
    constructor(
        message: string,
        public source: string,
        public cause?: Error,
    ) {
        super(message);
    }
}

// Search errors
class SearchError extends Error {
    constructor(
        message: string,
        public query: string,
        public cause?: Error,
    ) {
        super(message);
    }
}
```

### Error Recovery

```typescript
// Service includes automatic retry logic
const config = {
    sync: {
        retryAttempts: 3,
        retryDelay: 5000, // 5 seconds
    },
};

// Errors are logged and don't stop other sources
const stats = await indexerService.getStats();
console.log('Errors:', stats.errors);
```

---

## Performance Considerations

### Indexing Performance

```typescript
// Optimize batch sizes
const config = {
    indexing: {
        embedding: {
            batchSize: 100, // Balance between memory and throughput
        },
    },
};

// Enable selective indexing
const sources = {
    files: {
        enabled: true,
        options: {
            includePatterns: ['*.ts', '*.js', '*.md'], // Only index relevant files
            excludePatterns: ['node_modules/**', '.git/**'],
        },
    },
};
```

### Search Performance

```typescript
// Use semantic search for better results
const searchOptions = {
    semantic: true,
    hybridSearch: true,
    keywordWeight: 0.3, // Favor semantic over keyword
};

// Enable caching
const config = {
    indexing: {
        cache: {
            enabled: true,
            ttl: 300000, // 5 minutes
            maxSize: 1000,
        },
    },
};
```

### Memory Management

```typescript
// Limit context compilation
const context = await indexerService.getContext(queries, {
    limit: 20, // Reasonable limit for LLM context
    recentLimit: 10,
});

// Monitor memory usage
const stats = await indexerService.getStats();
console.log('Total content:', stats.total.totalContent);
console.log('Memory usage:', process.memoryUsage());
```

This API reference provides comprehensive documentation for all unified indexer service components and their usage patterns.
