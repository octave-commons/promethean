# API Reference - @promethean-os/unified-indexer

This document provides comprehensive API documentation for all public functions, types, and interfaces in the unified-indexer package.

## Table of Contents

- [Service Management](#service-management)
- [Search Engine](#search-engine)
- [Search Functions](#search-functions)
- [Types and Interfaces](#types-and-interfaces)
- [Configuration](#configuration)
- [Examples](#examples)

---

## Service Management

### `createUnifiedIndexerService(config)`

Creates a new unified indexer service instance with the specified configuration.

```typescript
async function createUnifiedIndexerService(
  config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerServiceState>;
```

**Parameters:**

- `config` (`UnifiedIndexerServiceConfig`): Configuration object for the service

**Returns:**

- `Promise<UnifiedIndexerServiceState>`: Service state instance

**Example:**

```typescript
import { createUnifiedIndexerService } from '@promethean-os/unified-indexer';

const service = await createUnifiedIndexerService({
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
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 100,
    },
  },
  sources: {
    files: { enabled: true, paths: ['./src', './docs'] },
    discord: { enabled: false },
    opencode: { enabled: false },
    kanban: { enabled: false },
  },
  sync: { interval: 300000, batchSize: 100 },
});
```

### `startUnifiedIndexerService(state)`

Starts the unified indexer service, enabling periodic synchronization.

```typescript
async function startUnifiedIndexerService(
  state: UnifiedIndexerServiceState,
): Promise<UnifiedIndexerServiceState>;
```

**Parameters:**

- `state` (`UnifiedIndexerServiceState`): Service state to start

**Returns:**

- `Promise<UnifiedIndexerServiceState>`: Updated service state

**Example:**

```typescript
const startedService = await startUnifiedIndexerService(service);
console.log('Service is running:', startedService.isRunning);
```

### `stopUnifiedIndexerService(state)`

Stops the unified indexer service and cleans up resources.

```typescript
async function stopUnifiedIndexerService(
  state: UnifiedIndexerServiceState,
): Promise<UnifiedIndexerServiceState>;
```

**Parameters:**

- `state` (`UnifiedIndexerServiceState`): Service state to stop

**Returns:**

- `Promise<UnifiedIndexerServiceState>`: Updated service state

**Example:**

```typescript
const stoppedService = await stopUnifiedIndexerService(service);
console.log('Service stopped:', !stoppedService.isRunning);
```

### `getServiceStatus(state)`

Gets the current status of the unified indexer service.

```typescript
function getServiceStatus(state: UnifiedIndexerServiceState): ServiceStatus;
```

**Parameters:**

- `state` (`UnifiedIndexerServiceState`): Service state to check

**Returns:**

- `ServiceStatus`: Current service status

**Example:**

```typescript
const status = getServiceStatus(service);
console.log({
  healthy: status.healthy,
  indexing: status.indexing,
  activeSources: status.activeSources,
  lastSync: new Date(status.lastSync).toISOString(),
});
```

---

## Search Engine

### `createCrossDomainSearchEngine(indexerService, defaultOptions)`

Creates a cross-domain search engine with enhanced search capabilities.

```typescript
function createCrossDomainSearchEngine(
  indexerService: UnifiedIndexerServiceState,
  defaultOptions?: Partial<CrossDomainSearchOptions>,
): CrossDomainSearchEngineState;
```

**Parameters:**

- `indexerService` (`UnifiedIndexerServiceState`): The indexer service to search
- `defaultOptions` (`Partial<CrossDomainSearchOptions>`, optional): Default search options

**Returns:**

- `CrossDomainSearchEngineState`: Search engine instance

**Example:**

```typescript
import { createCrossDomainSearchEngine } from '@promethean-os/unified-indexer';

const searchEngine = createCrossDomainSearchEngine(service, {
  semantic: true,
  timeBoost: true,
  sourceWeights: {
    filesystem: 1.2,
    discord: 1.0,
  },
});
```

---

## Search Functions

### `search(state, query)`

Performs cross-domain search with enhanced capabilities.

```typescript
async function search(
  state: CrossDomainSearchEngineState,
  query: CrossDomainSearchOptions,
): Promise<CrossDomainSearchResponse>;
```

**Parameters:**

- `state` (`CrossDomainSearchEngineState`): Search engine state
- `query` (`CrossDomainSearchOptions`): Search query and options

**Returns:**

- `Promise<CrossDomainSearchResponse>`: Enhanced search results

**Example:**

```typescript
const results = await search(searchEngine, {
  query: 'TypeScript contextStore',
  type: ['file', 'document'],
  limit: 20,
  semantic: true,
  timeBoost: true,
  includeContext: true,
  explainScores: true,
});

console.log(`Found ${results.results.length} results in ${results.took}ms`);
results.results.forEach((result) => {
  console.log(`- ${result.content.id} (score: ${result.score})`);
});
```

### `intelligentSearch(state, query, options)`

Search with intelligent query expansion and semantic enhancement.

```typescript
async function intelligentSearch(
  state: CrossDomainSearchEngineState,
  query: string,
  options?: Partial<CrossDomainSearchOptions>,
): Promise<CrossDomainSearchResponse>;
```

**Parameters:**

- `state` (`CrossDomainSearchEngineState`): Search engine state
- `query` (`string`): Search query
- `options` (`Partial<CrossDomainSearchOptions>`, optional): Additional search options

**Returns:**

- `Promise<CrossDomainSearchResponse>`: Enhanced search results

**Example:**

```typescript
const results = await intelligentSearch(searchEngine, 'indexing service', {
  limit: 15,
  includeAnalytics: true,
});

console.log('Expanded search results:', results.analytics);
```

### `getContextualSearch(state, queries, options)`

Get contextual search results optimized for LLM consumption.

```typescript
async function getContextualSearch(
  state: CrossDomainSearchEngineState,
  queries: string[],
  options?: Partial<CrossDomainSearchOptions>,
): Promise<{
  searchResults: CrossDomainSearchResponse;
  context: readonly ContextMessage[];
}>;
```

**Parameters:**

- `state` (`CrossDomainSearchEngineState`): Search engine state
- `queries` (`string[]`): Array of search queries
- `options` (`Partial<CrossDomainSearchOptions>`, optional): Additional search options

**Returns:**

- `Promise<{searchResults: CrossDomainSearchResponse; context: readonly ContextMessage[]}>`: Search results and LLM-ready context

**Example:**

```typescript
const { searchResults, context } = await getContextualSearch(
  searchEngine,
  ['unified indexer', 'contextStore', 'cross-domain search'],
  {
    limit: 20,
    formatForLLM: true,
    contextLimit: 10,
  },
);

console.log(`Generated ${context.length} context messages for LLM`);
```

---

## Types and Interfaces

### `UnifiedIndexerServiceState`

Main service state interface containing all service components and status.

```typescript
interface UnifiedIndexerServiceState {
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
```

### `CrossDomainSearchEngineState`

Search engine state containing indexer service and default options.

```typescript
interface CrossDomainSearchEngineState {
  indexerService: UnifiedIndexerServiceState;
  defaultOptions: Partial<CrossDomainSearchOptions>;
}
```

### `CrossDomainSearchOptions`

Advanced search options for cross-domain queries.

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
  recencyDecay?: number;

  // Semantic search options
  semanticThreshold?: number;
  hybridSearch?: boolean;
  keywordWeight?: number;

  // Result processing
  deduplicate?: boolean;
  groupBySource?: boolean;
  maxResultsPerSource?: number;

  // Analytics
  includeAnalytics?: boolean;
  explainScores?: boolean;
}
```

### `EnhancedSearchResult`

Enhanced search result with additional metadata and analytics.

```typescript
interface EnhancedSearchResult extends SearchResult {
  sourceType: ContentSource;
  contentType: ContentType;
  age: number;
  recencyScore: number;
  context?: ContextMessage[];
  contextRelevance?: number;
  scoreBreakdown?: {
    semantic: number;
    keyword: number;
    temporal: number;
    source: number;
    type: number;
    final: number;
  };
  explanation?: string;
}
```

### `CrossDomainSearchResponse`

Complete search response with results, analytics, and context.

```typescript
interface CrossDomainSearchResponse {
  results: EnhancedSearchResult[];
  total: number;
  took: number;
  query: CrossDomainSearchOptions;
  analytics?: {
    sourcesSearched: ContentSource[];
    typesFound: ContentType[];
    averageScore: number;
    scoreDistribution: Record<string, number>;
    temporalRange: {
      oldest: number;
      newest: number;
      span: number;
    };
  };
  context?: readonly ContextMessage[];
}
```

### `ServiceStatus`

Service status information.

```typescript
interface ServiceStatus {
  healthy: boolean;
  indexing: boolean;
  lastSync: number;
  nextSync: number;
  activeSources: readonly ContentSource[];
  issues: readonly string[];
}
```

---

## Configuration

### `UnifiedIndexerServiceConfig`

Complete configuration for the unified indexer service.

```typescript
interface UnifiedIndexerServiceConfig {
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
      paths: readonly string[];
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
    interval: number;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
  };
}
```

### `FileIndexingOptions`

Options for file indexing operations.

```typescript
interface FileIndexingOptions {
  batchSize?: number;
  excludePatterns?: readonly string[];
  includePatterns?: readonly string[];
  maxFileSize?: number;
  followSymlinks?: boolean;
}
```

---

## Examples

### Basic Service Setup

```typescript
import {
  createUnifiedIndexerService,
  startUnifiedIndexerService,
  createCrossDomainSearchEngine,
} from '@promethean-os/unified-indexer';

// Create and configure service
const service = await createUnifiedIndexerService({
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: process.env.CHROMA_DB_URL || 'http://localhost:8000',
      indexName: 'promethean-unified',
    },
    metadataStore: {
      type: 'mongodb',
      connectionString: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 100,
    },
  },
  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs'],
      options: {
        excludePatterns: ['node_modules/**', '.git/**', 'dist/**'],
        includePatterns: ['*.ts', '*.js', '*.md'],
      },
    },
    discord: { enabled: false },
    opencode: { enabled: false },
    kanban: { enabled: false },
  },
  sync: {
    interval: 300000, // 5 minutes
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000,
  },
});

// Start the service
await startUnifiedIndexerService(service);

// Create search engine
const searchEngine = createCrossDomainSearchEngine(service, {
  semantic: true,
  timeBoost: true,
});
```

### Advanced Search with Analytics

```typescript
// Perform comprehensive search
const results = await search(searchEngine, {
  query: 'TypeScript implementation patterns',
  type: ['file', 'document'],
  source: ['filesystem'],
  limit: 25,
  semantic: true,
  hybridSearch: true,
  timeBoost: true,
  recencyDecay: 48, // 48 hours
  deduplicate: true,
  groupBySource: true,
  maxResultsPerSource: 10,
  includeAnalytics: true,
  explainScores: true,
  includeContext: true,
  contextLimit: 15,
  formatForLLM: true,
});

// Analyze results
console.log('Search Analytics:', {
  totalResults: results.total,
  returnedResults: results.results.length,
  searchTime: `${results.took}ms`,
  sourcesSearched: results.analytics?.sourcesSearched,
  typesFound: results.analytics?.typesFound,
  averageScore: results.analytics?.averageScore,
  temporalRange: results.analytics?.temporalRange,
});

// Process top results
results.results.slice(0, 5).forEach((result, index) => {
  console.log(`${index + 1}. ${result.content.id}`);
  console.log(`   Score: ${result.score.toFixed(3)}`);
  console.log(`   Source: ${result.sourceType}`);
  console.log(`   Type: ${result.contentType}`);
  console.log(`   Age: ${Math.round(result.age / 1000 / 60)} minutes`);

  if (result.explanation) {
    console.log(`   Explanation: ${result.explanation}`);
  }

  if (result.scoreBreakdown) {
    console.log(`   Score Breakdown:`, result.scoreBreakdown);
  }

  console.log(`   Preview: ${result.content.content.substring(0, 100)}...`);
  console.log('');
});
```

### Context Compilation for LLM

```typescript
// Get LLM-ready context
const { searchResults, context } = await getContextualSearch(
  searchEngine,
  ['unified indexer architecture', 'contextStore integration', 'cross-domain search'],
  {
    limit: 20,
    semantic: true,
    includeAnalytics: true,
    formatForLLM: true,
    contextLimit: 12,
    sourceWeights: {
      filesystem: 1.3,
      opencode: 1.1,
    },
  },
);

console.log(`Generated ${context.length} context messages for LLM consumption`);

// Context is ready for LLM consumption
context.forEach((message, index) => {
  if (message && typeof message === 'object' && 'role' in message) {
    console.log(`${index + 1}. [${message.role}] ${message.content?.substring(0, 80)}...`);
  }
});

// Use context with LLM client
// const llmResponse = await llmClient.chat({
//   messages: [
//     { role: 'system', content: 'You are a helpful assistant.' },
//     ...context,
//     { role: 'user', content: 'Explain the unified indexer architecture.' }
//   ]
// });
```

### Service Monitoring

```typescript
// Monitor service health
const status = getServiceStatus(service);
console.log('Service Status:', {
  healthy: status.healthy,
  indexing: status.indexing,
  activeSources: status.activeSources,
  lastSync: new Date(status.lastSync).toISOString(),
  nextSync: new Date(status.nextSync).toISOString(),
  issues: status.issues,
});

// Get detailed statistics
const stats = service.stats;
console.log('Indexing Statistics:', {
  unified: {
    totalContent: stats.unified.total.totalContent,
    contentByType: stats.unified.total.contentByType,
    contentBySource: stats.unified.total.contentBySource,
    lastIndexed: new Date(stats.unified.total.lastIndexed).toISOString(),
  },
  fileIndexing: {
    totalFiles: stats.fileIndexing.totalFiles,
    indexedFiles: stats.fileIndexing.indexedFiles,
    skippedFiles: stats.fileIndexing.skippedFiles,
    errors: stats.fileIndexing.errors,
    duration: `${stats.fileIndexing.duration}ms`,
  },
});
```

---

## Error Handling

### Common Error Patterns

```typescript
try {
  const results = await search(searchEngine, {
    query: 'example search',
    limit: 10,
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Search failed:', error.message);

    // Handle specific error types
    if (error.message.includes('connection')) {
      console.error('Database connection issue - check configuration');
    } else if (error.message.includes('timeout')) {
      console.error('Search timeout - try reducing result limit');
    }
  }
}

// Service startup error handling
try {
  const service = await createUnifiedIndexerService(config);
  await startUnifiedIndexerService(service);
} catch (error) {
  console.error('Failed to start service:', error);

  // Check for common configuration issues
  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Cannot connect to database - check connection strings');
    } else if (error.message.includes('authentication')) {
      console.error('Authentication failed - check credentials');
    }
  }
}
```

### Graceful Shutdown

```typescript
async function gracefulShutdown(service: UnifiedIndexerServiceState) {
  try {
    console.log('Stopping unified indexer service...');
    await stopUnifiedIndexerService(service);
    console.log('Service stopped successfully');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  await gracefulShutdown(service);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await gracefulShutdown(service);
  process.exit(0);
});
```

---

## Type Safety

### Using TypeScript with Strict Types

```typescript
import type {
  UnifiedIndexerServiceConfig,
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  ContentSource,
  ContentType,
} from '@promethean-os/unified-indexer';

// Type-safe configuration
const config: UnifiedIndexerServiceConfig = {
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
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 100,
    },
  },
  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs'],
    },
    discord: { enabled: false },
    opencode: { enabled: false },
    kanban: { enabled: false },
  },
  sync: {
    interval: 300000,
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000,
  },
};

// Type-safe search options
const searchOptions: CrossDomainSearchOptions = {
  query: 'TypeScript patterns',
  type: ['file'] as ContentType[],
  source: ['filesystem'] as ContentSource[],
  limit: 20,
  semantic: true,
  timeBoost: true,
  includeAnalytics: true,
};

// Type-safe result processing
function processSearchResults(results: EnhancedSearchResult[]): void {
  results.forEach((result) => {
    // TypeScript ensures these properties exist
    console.log(`${result.sourceType}:${result.contentType} - ${result.score}`);

    if (result.scoreBreakdown) {
      const { semantic, keyword, temporal, final } = result.scoreBreakdown;
      console.log(
        `Score breakdown: semantic=${semantic}, keyword=${keyword}, temporal=${temporal}, final=${final}`,
      );
    }
  });
}
```

---

## Default Options

### `DEFAULT_SEARCH_OPTIONS`

The package provides sensible default options for search operations:

```typescript
import { DEFAULT_SEARCH_OPTIONS } from '@promethean-os/unified-indexer';

console.log(DEFAULT_SEARCH_OPTIONS);
// Output:
// {
//   semantic: true,
//   hybridSearch: true,
//   keywordWeight: 0.3,
//   timeBoost: true,
//   recencyDecay: 24,
//   deduplicate: true,
//   includeAnalytics: false,
//   explainScores: false,
//   sourceWeights: {
//     filesystem: 1.2,
//     discord: 1.0,
//     opencode: 1.1,
//     kanban: 1.0,
//     agent: 1.0,
//     user: 1.0,
//     system: 1.0,
//     external: 0.8,
//   },
//   typeWeights: {
//     file: 1.2,
//     document: 1.1,
//     message: 1.0,
//     task: 1.3,
//     event: 0.9,
//     session: 1.0,
//     attachment: 0.8,
//     thought: 1.1,
//     board: 1.0,
//   },
// }
```

Use these defaults as a starting point and customize as needed:

```typescript
const searchEngine = createCrossDomainSearchEngine(service, {
  ...DEFAULT_SEARCH_OPTIONS,
  includeAnalytics: true,
  explainScores: true,
  sourceWeights: {
    ...DEFAULT_SEARCH_OPTIONS.sourceWeights,
    filesystem: 1.5, // Boost filesystem results
  },
});
```

---

This API reference provides comprehensive documentation for all public interfaces in the unified-indexer package. For more detailed examples and integration patterns, see the other documentation files in this package.
