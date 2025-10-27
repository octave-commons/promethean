# Unified Indexer Service Guide

## Overview

The Unified Indexer Service provides a comprehensive solution for indexing and searching content from multiple data sources (files, Discord, OpenCode, Kanban) and making it available through the contextStore for LLM consumption.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │    │  Unified Indexer │    │  ContextStore   │
│                 │───▶│     Service      │───▶│                 │
│ • Files         │    │                  │    │ • Collections   │
│ • Discord       │    │ • Indexing       │    │ • Search       │
│ • OpenCode      │    │ • Search         │    │ • Context      │
│ • Kanban        │    │ • Sync           │    │   Compilation   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Key Components

### 1. Unified Indexer Service (`unified-indexer-service.ts`)

Main orchestrator that:

-   Manages multiple data source indexers
-   Provides periodic synchronization
-   Offers unified search across all sources
-   Compiles context for LLM consumption

### 2. Migration Adapters

Existing adapters that transform domain-specific data to unified format:

-   **File System Adapter** - Indexes files and directories
-   **Discord Adapter** - Indexes Discord messages and attachments
-   **OpenCode Adapter** - Indexes sessions, events, and messages
-   **Kanban Adapter** - Indexes tasks and boards

### 3. Cross-Domain Search (`cross-domain-search.ts`)

Advanced search capabilities:

-   Semantic and keyword search
-   Source and type weighting
-   Temporal boosting
-   Result deduplication and grouping
-   Analytics and explanations

### 4. ContextStore Integration

Seamless integration with existing contextStore:

-   Uses same DualStoreManager collections
-   Compatible with existing `compileContext()` usage
-   Maintains backward compatibility

## Quick Start

### Basic Usage

```typescript
import { createUnifiedIndexerService, type UnifiedIndexerServiceConfig } from '@promethean-os/persistence';

// Configure the service
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
        },
    },
    sources: {
        files: {
            enabled: true,
            paths: ['./src', './docs'],
            options: {
                excludePatterns: ['node_modules/**', '.git/**'],
                includePatterns: ['*.ts', '*.js', '*.md'],
            },
        },
    },
    sync: {
        interval: 300000, // 5 minutes
        batchSize: 100,
    },
};

// Create and start service
const indexerService = await createUnifiedIndexerService(config);
await indexerService.start();
```

### ContextStore Integration

```typescript
// Get context for LLM (same as existing contextStore usage)
const context = await indexerService.getContext(['unified indexer', 'contextStore'], {
    recentLimit: 10,
    queryLimit: 5,
    limit: 15,
    formatAssistantMessages: true,
});

// Context is compatible with existing LLM clients
console.log(`Retrieved ${context.length} context messages`);
```

### Cross-Domain Search

```typescript
import { createCrossDomainSearchEngine } from '@promethean-os/persistence';

// Create search engine
const searchEngine = createCrossDomainSearchEngine(indexerService, {
    semantic: true,
    timeBoost: true,
    sourceWeights: {
        filesystem: 1.2,
        discord: 1.0,
    },
});

// Perform advanced search
const results = await searchEngine.search({
    query: 'TypeScript implementation',
    type: ['file', 'document'],
    limit: 20,
    includeContext: true,
    explainScores: true,
    includeAnalytics: true,
});

console.log(`Found ${results.results.length} results`);
console.log('Analytics:', results.analytics);
```

## Configuration Options

### Indexing Configuration

```typescript
interface UnifiedIndexerServiceConfig {
    // Vector and metadata store configuration
    indexing: {
        vectorStore: {
            type: 'chromadb' | 'pinecone' | 'weaviate' | 'qdrant';
            connectionString: string;
            indexName?: string;
        };
        metadataStore: {
            type: 'sqlite' | 'postgresql' | 'mongodb';
            connectionString: string;
        };
        embedding: {
            model: string;
            dimensions: number;
            batchSize: number;
        };
    };

    // Context store collections
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

    // Data source enablement
    sources: {
        files: {
            enabled: boolean;
            paths: string[];
            options?: FileIndexingOptions;
        };
        discord: { enabled: boolean };
        opencode: { enabled: boolean };
        kanban: { enabled: boolean };
    };

    // Sync behavior
    sync: {
        interval: number; // milliseconds
        batchSize: number;
        retryAttempts: number;
        retryDelay: number;
    };
}
```

### Search Options

```typescript
interface CrossDomainSearchOptions {
    // Basic search
    query?: string;
    type?: ContentType | ContentType[];
    source?: ContentSource | ContentSource[];
    limit?: number;

    // Advanced features
    includeContext?: boolean;
    contextLimit?: number;
    formatForLLM?: boolean;

    // Weighting and boosting
    sourceWeights?: Record<ContentSource, number>;
    typeWeights?: Record<ContentType, number>;
    timeBoost?: boolean;
    recencyDecay?: number;

    // Search modes
    semantic?: boolean;
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

## Data Flow

### Indexing Flow

1. **Source Indexing**: Each adapter indexes its domain-specific data
2. **Transformation**: Data is transformed to `IndexableContent` format
3. **Unified Storage**: Content is stored via `UnifiedIndexingClient`
4. **Context Population**: Data is available in contextStore collections
5. **Periodic Sync**: Service keeps data fresh with configurable intervals

### Search Flow

1. **Query Processing**: Expand and enhance search queries
2. **Multi-Source Search**: Search across all indexed content
3. **Result Enhancement**: Add temporal, source, and type metadata
4. **Advanced Filtering**: Apply weights, boosting, and deduplication
5. **Context Compilation**: Generate LLM-ready context if requested
6. **Analytics Generation**: Provide detailed search analytics

## Migration from Existing Indexers

### From Individual Indexers

```typescript
// Before: Multiple separate indexers
const fileIndexer = new FileIndexer();
const discordIndexer = new DiscordIndexer();
const opencodeIndexer = new OpenCodeIndexer();

// After: Single unified service
const unifiedService = await createUnifiedIndexerService(config);
await unifiedService.start();

// Search is now unified
const results = await unifiedService.search({ query: 'example' });
```

### ContextStore Compatibility

```typescript
// Existing contextStore usage still works
import { createContextStore, compileContext } from '@promethean-os/persistence';

// New unified approach provides the same interface
const context = await unifiedService.getContext(['query'], options);
// context is identical format as compileContext() result
```

## Performance Considerations

### Indexing Performance

-   **Batch Processing**: Use appropriate batch sizes (50-100 items)
-   **Concurrency**: Configure based on system capabilities
-   **Selective Indexing**: Enable only needed sources
-   **Incremental Updates**: Service handles incremental changes

### Search Performance

-   **Semantic Search**: Enables conceptual matching, better than keyword alone
-   **Temporal Boosting**: Prioritizes recent content
-   **Source Weighting**: Emphasizes trusted sources
-   **Result Caching**: Built-in caching reduces repeated queries

### Memory Usage

-   **Collection Management**: Separate collections prevent memory bloat
-   **Context Limits**: Use reasonable context limits (10-20 messages)
-   **Batch Sizing**: Configure based on available memory

## Monitoring and Analytics

### Service Status

```typescript
const status = await indexerService.getStatus();
console.log({
    healthy: status.healthy,
    indexing: status.indexing,
    activeSources: status.activeSources,
    lastSync: new Date(status.lastSync),
    issues: status.issues,
});
```

### Search Analytics

```typescript
const results = await searchEngine.search({
    query: 'example',
    includeAnalytics: true,
});

console.log('Search Analytics:', {
    sourcesSearched: results.analytics.sourcesSearched,
    typesFound: results.analytics.typesFound,
    averageScore: results.analytics.averageScore,
    temporalRange: results.analytics.temporalRange,
});
```

## Troubleshooting

### Common Issues

1. **Service Won't Start**

    - Check MongoDB and ChromaDB connections
    - Verify configuration format
    - Ensure required environment variables

2. **No Search Results**

    - Verify sources are enabled and synced
    - Check search query format
    - Review content indexing status

3. **Poor Search Quality**

    - Enable semantic search
    - Adjust source and type weights
    - Use query expansion features

4. **High Memory Usage**
    - Reduce batch sizes
    - Limit context compilation size
    - Enable result caching

### Debug Logging

```typescript
// Enable debug logging
const config = {
    // ... other config
    indexing: {
        // ... indexing config
        validation: {
            strict: true,
            skipVectorValidation: false,
        },
    },
};

// Check service logs for detailed information
```

## Examples

See `unified-indexer-example.ts` for complete working examples including:

-   Service initialization and startup
-   Cross-domain search demonstrations
-   Context compilation for LLM
-   Real-time search simulation
-   Analytics and monitoring

## Future Enhancements

Planned improvements:

-   **Real-time Streaming**: Live content updates
-   **Advanced Analytics**: Search patterns and insights
-   **ML-Based Ranking**: Learning from user interactions
-   **Multi-tenant**: Support for multiple users/spaces
-   **Distributed Indexing**: Horizontal scaling capabilities

## API Reference

Detailed API documentation is available in the source files:

-   `unified-indexer-service.ts` - Main service interface
-   `cross-domain-search.ts` - Advanced search capabilities
-   `unified-content-model.ts` - Content type definitions
-   `unified-indexing-api.ts` - Core indexing interface
