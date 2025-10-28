# Integration Guide - @promethean-os/unified-indexer

This comprehensive guide covers integration patterns for unified-indexer with other Promethean OS components, external services, and various application architectures.

## Table of Contents

- [Overview](#overview)
- [Persistence Integration](#persistence-integration)
- [ContextStore Integration](#contextstore-integration)
- [OpenCode Integration](#opencode-integration)
- [Kanban Integration](#kanban-integration)
- [Discord Integration](#discord-integration)
- [LLM Integration](#llm-integration)
- [Web Service Integration](#web-service-integration)
- [Microservices Integration](#microservices-integration)
- [Migration Patterns](#migration-patterns)

---

## Overview

The unified-indexer package is designed to integrate seamlessly with other Promethean OS components while maintaining flexibility for various deployment scenarios.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Integration Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Web Services │  │   LLM Clients  │  │   Background    │  │
│  │                 │  │                 │  │   Services     │  │
│  │ • Express.js    │  │ • OpenAI        │  │ • Workers       │  │
│  │ • Fastify       │  │ • Anthropic     │  │ • Cron Jobs     │  │
│  │ • Koa          │  │ • Local Models  │  │ • Event Handlers│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                   │                   │              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Unified Indexer Service                      │  │
│  │                                                             │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  │   Data Sources  │  │   Search Engine │  │  Context    │  │
│  │  │                 │  │                 │  │  Store     │  │
│  │  │ • Files         │  │ • Cross-Domain  │  │ • LLM Ready │  │
│  │  │ • Discord       │  │ • Semantic      │  │ • Messages  │  │
│  │  │ • OpenCode      │  │ • Hybrid        │  │ • Format    │  │
│  │  │ • Kanban        │  │ • Analytics     │  │ • Cache     │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  └─────────────────────────────────────────────────────────────┘  │
│           │                   │                   │              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Persistence   │  │   External      │  │   Monitoring    │  │
│  │                 │  │   Services     │  │                 │  │
│  │ • DualStore     │  │ • APIs          │  │ • Metrics       │  │
│  │ • MongoDB       │  │ • Webhooks      │  │ • Health        │  │
│  │ • ChromaDB      │  │ • Events        │  │ • Logs          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Persistence Integration

### Basic Persistence Setup

The unified-indexer is built on top of the @promethean-os/persistence package and uses its core components:

```typescript
import {
  DualStoreManager,
  createContextStore,
  compileContext,
  type UnifiedIndexingClient,
  type ContextStoreState,
} from '@promethean-os/persistence';

import {
  createUnifiedIndexerService,
  createCrossDomainSearchEngine,
} from '@promethean-os/unified-indexer';

async function setupPersistenceIntegration() {
  // Create unified indexer service (uses DualStoreManager internally)
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
    // ... other config
  });

  // The service creates a ContextStore that's compatible with existing usage
  const contextStore = service.contextStore;

  // Use existing compileContext function
  const context = await compileContext(contextStore, {
    texts: ['unified indexer', 'persistence integration'],
    recentLimit: 10,
    queryLimit: 5,
    limit: 15,
    formatAssistantMessages: true,
  });

  console.log(`Generated ${context.length} context messages`);
  return { service, contextStore, context };
}
```

### Advanced Persistence Integration

```typescript
import { DualStoreManager } from '@promethean-os/persistence';

async function advancedPersistenceIntegration() {
  // Create custom DualStoreManager for direct access
  const dualStore = await DualStoreManager.create('custom', 'text', 'createdAt');

  // Use with unified indexer
  const service = await createUnifiedIndexerService({
    indexing: {
      // ... standard config
    },
    // Custom context store with the dual store
    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
      formatTime: (ms: number) => new Date(ms).toISOString(),
      assistantName: 'Promethean',
    },
  });

  // Direct access to underlying storage
  const searchResults = await dualStore.getMostRelevant(['search query'], 20, {
    source: 'filesystem',
  });

  console.log(`Found ${searchResults.length} direct search results`);

  // Get consistency report
  const report = await dualStore.getConsistencyReport();
  console.log('Storage consistency:', report);

  return { service, dualStore };
}
```

### Migration from Existing Persistence

```typescript
async function migrateFromExistingPersistence() {
  // Existing persistence setup
  const existingDualStore = await DualStoreManager.create('existing', 'text', 'createdAt');
  const existingContextStore = createContextStore(
    (ms: number) => new Date(ms).toISOString(),
    'Existing Assistant',
  );

  // Create unified indexer with migration
  const unifiedService = await createUnifiedIndexerService({
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'migrated-unified',
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
        paths: ['./existing-data'],
        options: {
          // Migration-specific options
          batchSize: 50,
          includePatterns: ['*.json', '*.md'],
        },
      },
      discord: { enabled: false },
      opencode: { enabled: false },
      kanban: { enabled: false },
    },
    sync: {
      interval: 60000, // Frequent during migration
      batchSize: 50,
      retryAttempts: 5,
      retryDelay: 2000,
    },
    contextStore: {
      collections: {
        files: 'migrated-files',
        discord: 'migrated-discord',
        opencode: 'migrated-opencode',
        kanban: 'migrated-kanban',
        unified: 'migrated-unified',
      },
      formatTime: (ms: number) => new Date(ms).toISOString(),
      assistantName: 'Migrated Promethean',
    },
  });

  // Start migration
  await startUnifiedIndexerService(unifiedService);

  // Compare old vs new
  const oldContext = await compileContext(existingContextStore, {
    texts: ['test query'],
    limit: 10,
  });

  const searchEngine = createCrossDomainSearchEngine(unifiedService);
  const newResults = await search(searchEngine, {
    query: 'test query',
    limit: 10,
  });

  console.log('Migration comparison:', {
    oldResults: oldContext.length,
    newResults: newResults.results.length,
  });

  return { unifiedService, oldContext, newResults };
}
```

---

## ContextStore Integration

### Seamless ContextStore Usage

The unified-indexer provides ContextStore integration that's fully compatible with existing usage patterns:

```typescript
import { compileContext } from '@promethean-os/persistence';
import { getContextualSearch } from '@promethean-os/unified-indexer';

async function contextStoreIntegration(searchEngine: CrossDomainSearchEngineState) {
  // Method 1: Direct contextual search (recommended)
  const { searchResults, context } = await getContextualSearch(
    searchEngine,
    ['unified indexer', 'contextStore patterns'],
    {
      limit: 20,
      semantic: true,
      formatForLLM: true,
      contextLimit: 12,
    },
  );

  console.log(`Generated ${context.length} context messages`);

  // Method 2: Traditional compileContext (still works)
  const traditionalContext = await compileContext(searchEngine.indexerService.contextStore, {
    texts: ['unified indexer', 'contextStore patterns'],
    recentLimit: 10,
    queryLimit: 5,
    limit: 15,
    formatAssistantMessages: true,
  });

  console.log(`Traditional context: ${traditionalContext.length} messages`);

  // Both methods produce compatible output
  return { contextualContext: context, traditionalContext };
}
```

### ContextStore for Different Use Cases

```typescript
async function contextStoreUseCases(searchEngine: CrossDomainSearchEngineState) {
  // Use Case 1: Code Documentation
  const codeContext = await getContextualSearch(
    searchEngine,
    ['TypeScript implementation', 'class design patterns', 'interface definitions'],
    {
      limit: 15,
      type: ['file'],
      sourceWeights: { filesystem: 1.5 },
      contextLimit: 8,
      formatForLLM: true,
    },
  );

  // Use Case 2: Troubleshooting
  const troubleshootingContext = await getContextualSearch(
    searchEngine,
    ['error handling', 'debugging patterns', 'common issues'],
    {
      limit: 12,
      timeBoost: true,
      recencyDecay: 24, // Recent content
      contextLimit: 6,
      formatForLLM: true,
    },
  );

  // Use Case 3: Learning Materials
  const learningContext = await getContextualSearch(
    searchEngine,
    ['tutorial', 'getting started', 'best practices'],
    {
      limit: 20,
      type: ['document', 'file'],
      sourceWeights: { filesystem: 1.3 },
      contextLimit: 10,
      formatForLLM: true,
    },
  );

  return {
    codeContext: codeContext.context,
    troubleshootingContext: troubleshootingContext.context,
    learningContext: learningContext.context,
  };
}
```

### ContextStore with Custom Formatting

```typescript
async function customContextFormatting(searchEngine: CrossDomainSearchEngineState) {
  // Custom time formatting
  const customConfig = {
    limit: 15,
    semantic: true,
    formatForLLM: true,
    contextLimit: 10,

    // Custom formatting options
    includeMetadata: true,
    truncateContent: true,
    maxContentLength: 500,

    // Custom message formatting
    messageFormat: 'detailed', // 'compact' | 'detailed' | 'structured'
    includeTimestamps: true,
    includeSources: true,
    includeScores: true,
  };

  const { context } = await getContextualSearch(
    searchEngine,
    ['unified indexer architecture'],
    customConfig,
  );

  // Process formatted context
  const formattedContext = context
    .map((msg, index) => {
      if (msg && typeof msg === 'object' && 'content' in msg) {
        const message = msg as {
          role?: string;
          content?: string;
          timestamp?: number;
          source?: string;
          score?: number;
        };

        return {
          index: index + 1,
          role: message.role || 'unknown',
          content: message.content?.substring(0, 200) || '',
          metadata: {
            timestamp: message.timestamp,
            source: message.source,
            score: message.score,
            length: message.content?.length || 0,
          },
        };
      }
      return null;
    })
    .filter(Boolean);

  console.log('Formatted context:', formattedContext);
  return formattedContext;
}
```

---

## OpenCode Integration

### Basic OpenCode Integration

```typescript
async function openCodeIntegration() {
  const service = await createUnifiedIndexerService({
    indexing: {
      // Standard indexing configuration
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'promethean-opencode',
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

    // Enable OpenCode integration
    sources: {
      files: {
        enabled: true,
        paths: ['./src'],
        options: {
          includePatterns: ['*.ts', '*.js', '*.md'],
        },
      },
      opencode: {
        enabled: true,
        sessionId: process.env.OPENCODE_SESSION_ID,
        apiEndpoint: process.env.OPENCODE_API_ENDPOINT || 'http://localhost:3001',
        apiKey: process.env.OPENCODE_API_KEY,
        options: {
          indexSessions: true,
          indexEvents: true,
          indexMessages: true,
          indexCode: true,
          maxSessionAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          batchSize: 50,
        },
      },
      discord: { enabled: false },
      kanban: { enabled: false },
    },

    sync: {
      interval: 300000, // 5 minutes
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 5000,
    },

    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
    },
  });

  await startUnifiedIndexerService(service);

  // Search across OpenCode content
  const searchEngine = createCrossDomainSearchEngine(service);
  const results = await search(searchEngine, {
    query: 'session management patterns',
    source: ['opencode'],
    limit: 15,
    semantic: true,
    includeAnalytics: true,
  });

  console.log(`Found ${results.results.length} OpenCode results`);
  results.results.forEach((result) => {
    console.log(`- ${result.content.id} (${result.content.type})`);
    console.log(`  ${result.content.content.substring(0, 100)}...`);
  });

  return { service, results };
}
```

### Advanced OpenCode Integration

```typescript
async function advancedOpenCodeIntegration() {
  const service = await createUnifiedIndexerService({
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: process.env.CHROMA_DB_URL,
        indexName: 'promethean-opencode-advanced',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: process.env.MONGODB_URL,
      },
      embedding: {
        model: 'text-embedding-ada-002',
        dimensions: 1536,
        batchSize: 100,
        cacheEmbeddings: true,
      },
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
        provider: 'redis',
      },
    },

    sources: {
      files: {
        enabled: true,
        paths: ['./src', './packages'],
        options: {
          includePatterns: ['*.ts', '*.js', '*.tsx', '*.jsx'],
          excludePatterns: ['*.test.*', '*.spec.*'],
        },
      },
      opencode: {
        enabled: true,
        sessionId: process.env.OPENCODE_SESSION_ID,
        apiEndpoint: process.env.OPENCODE_API_ENDPOINT,
        apiKey: process.env.OPENCODE_API_KEY,
        options: {
          // Comprehensive OpenCode indexing
          indexSessions: true,
          indexEvents: true,
          indexMessages: true,
          indexCode: true,
          indexThoughts: true, // Custom extension
          indexAttachments: true,

          // Extended retention
          maxSessionAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          maxEventAge: 14 * 24 * 60 * 60 * 1000, // 14 days
          maxMessageAge: 7 * 24 * 60 * 60 * 1000, // 7 days

          // Performance tuning
          batchSize: 75,
          maxConcurrentRequests: 5,

          // Content filtering
          includeSystemEvents: true,
          includeUserActions: true,
          includeAgentResponses: true,
          excludeDebugEvents: true,
        },
      },
      discord: { enabled: false },
      kanban: { enabled: false },
    },

    sync: {
      interval: 120000, // 2 minutes for fresh data
      batchSize: 150,
      retryAttempts: 5,
      retryDelay: 3000,
    },

    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
      formatTime: (ms: number) => {
        const date = new Date(ms);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },
    },
  });

  await startUnifiedIndexerService(service);
  const searchEngine = createCrossDomainSearchEngine(service, {
    sourceWeights: {
      opencode: 1.3, // Boost OpenCode content
      filesystem: 1.0,
    },
    typeWeights: {
      session: 1.2,
      event: 1.1,
      message: 1.0,
      code: 1.4, // Boost code snippets
    },
  });

  // Advanced OpenCode search scenarios
  const searchScenarios = [
    {
      name: 'Session Analysis',
      query: 'problem-solving approaches',
      type: ['session'],
      options: { timeBoost: true, recencyDecay: 48 },
    },
    {
      name: 'Code Patterns',
      query: 'TypeScript class implementation',
      type: ['code'],
      options: { semantic: true, includeAnalytics: true },
    },
    {
      name: 'Event Tracking',
      query: 'error events debugging',
      type: ['event'],
      options: { explainScores: true, limit: 20 },
    },
  ];

  for (const scenario of searchScenarios) {
    console.log(`\n🔍 ${scenario.name}:`);

    const results = await search(searchEngine, {
      query: scenario.query,
      type: scenario.type,
      source: ['opencode'],
      limit: 15,
      semantic: true,
      includeAnalytics: true,
      ...scenario.options,
    });

    console.log(`  Found ${results.results.length} results`);

    if (results.analytics) {
      console.log(`  Sources: ${results.analytics.sourcesSearched.join(', ')}`);
      console.log(`  Types: ${results.analytics.typesFound.join(', ')}`);
      console.log(`  Avg score: ${results.analytics.averageScore.toFixed(3)}`);
    }
  }

  return { service, searchEngine };
}
```

---

## Kanban Integration

### Basic Kanban Integration

```typescript
async function kanbanIntegration() {
  const service = await createUnifiedIndexerService({
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'promethean-kanban',
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
        paths: ['./src'],
        options: {
          includePatterns: ['*.ts', '*.js', '*.md'],
        },
      },
      kanban: {
        enabled: true,
        boardId: process.env.KANBAN_BOARD_ID,
        apiEndpoint: process.env.KANBAN_API_ENDPOINT || 'http://localhost:3002',
        apiKey: process.env.KANBAN_API_KEY,
        options: {
          indexTasks: true,
          indexProjects: true,
          indexComments: true,
          indexAttachments: true,
          maxTaskAge: 90 * 24 * 60 * 60 * 1000, // 90 days
          batchSize: 50,
        },
      },
      discord: { enabled: false },
      opencode: { enabled: false },
    },

    sync: {
      interval: 600000, // 10 minutes
      batchSize: 75,
      retryAttempts: 3,
      retryDelay: 5000,
    },

    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
    },
  });

  await startUnifiedIndexerService(service);

  // Search Kanban content
  const searchEngine = createCrossDomainSearchEngine(service, {
    sourceWeights: {
      kanban: 1.2, // Boost Kanban content
      filesystem: 1.0,
    },
    typeWeights: {
      task: 1.3, // Boost tasks
      project: 1.1,
      board: 1.0,
    },
  });

  const results = await search(searchEngine, {
    query: 'project management tasks',
    source: ['kanban'],
    limit: 15,
    semantic: true,
    includeAnalytics: true,
  });

  console.log(`Found ${results.results.length} Kanban results`);
  results.results.forEach((result) => {
    console.log(`- ${result.content.id} (${result.content.type})`);
    console.log(`  ${result.content.content.substring(0, 100)}...`);
  });

  return { service, results };
}
```

### Advanced Kanban Integration

```typescript
async function advancedKanbanIntegration() {
  const service = await createUnifiedIndexerService({
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: process.env.CHROMA_DB_URL,
        indexName: 'promethean-kanban-advanced',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: process.env.MONGODB_URL,
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
          includePatterns: ['*.ts', '*.js', '*.md'],
        },
      },
      kanban: {
        enabled: true,
        boardId: process.env.KANBAN_BOARD_ID,
        apiEndpoint: process.env.KANBAN_API_ENDPOINT,
        apiKey: process.env.KANBAN_API_KEY,
        options: {
          // Comprehensive Kanban indexing
          indexTasks: true,
          indexProjects: true,
          indexComments: true,
          indexAttachments: true,
          indexSubtasks: true,
          indexLabels: true,
          indexMilestones: true,

          // Extended retention
          maxTaskAge: 180 * 24 * 60 * 60 * 1000, // 180 days
          maxProjectAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          maxCommentAge: 90 * 24 * 60 * 60 * 1000, // 90 days

          // Performance tuning
          batchSize: 100,
          maxConcurrentRequests: 3,

          // Content filtering
          includeArchived: false,
          includeDeleted: false,
          includePrivate: false,
          priorityLevels: ['high', 'medium', 'low'],
          statusFilter: ['todo', 'in-progress', 'review'],
        },
      },
      discord: { enabled: false },
      opencode: { enabled: false },
    },

    sync: {
      interval: 300000, // 5 minutes for real-time updates
      batchSize: 100,
      retryAttempts: 5,
      retryDelay: 3000,
    },

    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
    },
  });

  await startUnifiedIndexerService(service);
  const searchEngine = createCrossDomainSearchEngine(service, {
    sourceWeights: {
      kanban: 1.4, // Strong boost for Kanban
      filesystem: 1.0,
    },
    typeWeights: {
      task: 1.5, // Strong boost for tasks
      project: 1.2,
      comment: 1.1,
      milestone: 1.3,
    },
  });

  // Advanced Kanban search scenarios
  const searchScenarios = [
    {
      name: 'Active Tasks',
      query: 'current sprint tasks',
      type: ['task'],
      options: {
        timeBoost: true,
        recencyDecay: 24, // Very recent
        limit: 20,
      },
    },
    {
      name: 'Project Overview',
      query: 'project status milestones',
      type: ['project', 'milestone'],
      options: {
        semantic: true,
        includeAnalytics: true,
        explainScores: true,
      },
    },
    {
      name: 'Problem Resolution',
      query: 'blocked issues dependencies',
      type: ['task', 'comment'],
      options: {
        hybridSearch: true,
        keywordWeight: 0.4,
        limit: 15,
      },
    },
  ];

  for (const scenario of searchScenarios) {
    console.log(`\n🔍 ${scenario.name}:`);

    const results = await search(searchEngine, {
      query: scenario.query,
      type: scenario.type,
      source: ['kanban'],
      limit: 15,
      semantic: true,
      includeAnalytics: true,
      ...scenario.options,
    });

    console.log(`  Found ${results.results.length} results`);

    // Show task-specific information
    results.results.slice(0, 5).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.content.id}`);
      console.log(`     Type: ${result.content.type}`);
      console.log(`     Score: ${result.score.toFixed(3)}`);
      console.log(`     ${result.content.content.substring(0, 80)}...`);

      if (result.scoreBreakdown) {
        console.log(
          `     Breakdown: semantic=${result.scoreBreakdown.semantic.toFixed(3)}, temporal=${result.scoreBreakdown.temporal.toFixed(3)}`,
        );
      }
    });
  }

  return { service, searchEngine };
}
```

---

## Discord Integration

### Basic Discord Integration

```typescript
async function discordIntegration() {
  const service = await createUnifiedIndexerService({
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'promethean-discord',
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
        paths: ['./src'],
        options: {
          includePatterns: ['*.ts', '*.js', '*.md'],
        },
      },
      discord: {
        enabled: true,
        provider: 'discord-api',
        botToken: process.env.DISCORD_BOT_TOKEN,
        guildIds: [process.env.DISCORD_GUILD_ID],
        options: {
          indexAttachments: true,
          indexThreads: true,
          maxMessageAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          batchSize: 100,
          excludeChannels: ['bot-commands', 'off-topic'],
          includeChannels: ['development', 'support', 'documentation'],
        },
      },
      opencode: { enabled: false },
      kanban: { enabled: false },
    },

    sync: {
      interval: 300000, // 5 minutes
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 5000,
    },

    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
    },
  });

  await startUnifiedIndexerService(service);

  // Search Discord content
  const searchEngine = createCrossDomainSearchEngine(service, {
    sourceWeights: {
      discord: 1.2, // Boost Discord content
      filesystem: 1.0,
    },
    typeWeights: {
      message: 1.3, // Boost messages
      attachment: 1.1,
    },
  });

  const results = await search(searchEngine, {
    query: 'development discussion TypeScript',
    source: ['discord'],
    limit: 15,
    semantic: true,
    includeAnalytics: true,
  });

  console.log(`Found ${results.results.length} Discord results`);
  results.results.forEach((result) => {
    console.log(`- ${result.content.id} (${result.content.type})`);
    console.log(`  ${result.content.content.substring(0, 100)}...`);
  });

  return { service, results };
}
```

---

## LLM Integration

### OpenAI Integration

```typescript
import OpenAI from 'openai';

async function openaiIntegration(searchEngine: CrossDomainSearchEngineState) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const userQueries = [
    'How do I implement unified indexer service?',
    'What are the best practices for context compilation?',
    'How do I optimize search performance?',
  ];

  for (const query of userQueries) {
    try {
      console.log(`\n🤖 Processing query: "${query}"`);

      // Get relevant context
      const { context } = await getContextualSearch(searchEngine, [query], {
        limit: 20,
        semantic: true,
        formatForLLM: true,
        contextLimit: 12,
        timeBoost: true,
      });

      console.log(`Retrieved ${context.length} context messages`);

      // Build conversation
      const messages = [
        {
          role: 'system',
          content:
            'You are a helpful assistant specializing in Promethean OS unified indexer system. Use the provided context to answer questions accurately and concisely.',
        },
        ...context,
        {
          role: 'user',
          content: query,
        },
      ];

      // Get LLM response
      const startTime = Date.now();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      const responseTime = Date.now() - startTime;

      const response = completion.choices[0]?.message?.content || 'No response';

      console.log(`💬 LLM Response (${responseTime}ms):`);
      console.log(response);

      // Show context usage
      const contextTokens = context.reduce((sum, msg) => sum + (msg?.content?.length || 0), 0);
      console.log(
        `📊 Context usage: ${context.length} messages, ~${Math.round(contextTokens / 4)} tokens`,
      );
    } catch (error) {
      console.error(`❌ Failed to process query "${query}":`, error);
    }
  }
}
```

### Multi-LLM Integration

```typescript
async function multiLlmIntegration(searchEngine: CrossDomainSearchEngineState) {
  // Mock LLM clients - replace with actual implementations
  const llmClients = {
    openai: {
      name: 'OpenAI GPT-4',
      chat: async (messages: any[]) => ({ content: 'OpenAI response', model: 'gpt-4' }),
    },
    anthropic: {
      name: 'Anthropic Claude',
      chat: async (messages: any[]) => ({ content: 'Anthropic response', model: 'claude-3' }),
    },
    local: {
      name: 'Local Model',
      chat: async (messages: any[]) => ({ content: 'Local model response', model: 'local-llm' }),
    },
  };

  const query = 'What are the key features of unified indexer?';

  // Get shared context
  const { context } = await getContextualSearch(searchEngine, [query], {
    limit: 15,
    semantic: true,
    formatForLLM: true,
    contextLimit: 10,
  });

  console.log(`🔍 Query: "${query}"`);
  console.log(`📚 Context: ${context.length} messages\n`);

  // Test with different LLMs
  for (const [provider, client] of Object.entries(llmClients)) {
    try {
      console.log(`🤖 Testing with ${client.name}:`);

      const startTime = Date.now();
      const response = await client.chat([
        { role: 'system', content: 'You are a helpful assistant.' },
        ...context,
        { role: 'user', content: query },
      ]);
      const responseTime = Date.now() - startTime;

      console.log(`  Response (${responseTime}ms): ${response.content}`);
      console.log(`  Model: ${response.model}\n`);
    } catch (error) {
      console.error(`  ❌ Error with ${client.name}:`, error);
    }
  }
}
```

### LLM with Streaming

```typescript
async function streamingLlmIntegration(searchEngine: CrossDomainSearchEngineState) {
  const query = 'Explain the unified indexer architecture';

  // Get context
  const { context } = await getContextualSearch(searchEngine, [query], {
    limit: 20,
    semantic: true,
    formatForLLM: true,
    contextLimit: 12,
  });

  console.log(`🔍 Query: "${query}"`);
  console.log(`📚 Context: ${context.length} messages`);

  // Mock streaming LLM - replace with actual implementation
  class StreamingLLM {
    async *chatStream(messages: any[]) {
      const response =
        'Based on the provided context, the unified indexer architecture consists of several key components...';
      const words = response.split(' ');

      for (const word of words) {
        yield { content: word + ' ', done: false };
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate streaming delay
      }

      yield { content: '', done: true };
    }
  }

  const llm = new StreamingLLM();

  console.log('\n🤖 Streaming response:');

  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    ...context,
    { role: 'user', content: query },
  ];

  let fullResponse = '';
  const startTime = Date.now();

  for await (const chunk of llm.chatStream(messages)) {
    process.stdout.write(chunk.content);
    fullResponse += chunk.content;

    if (chunk.done) {
      const totalTime = Date.now() - startTime;
      console.log(`\n\n⏱️ Total time: ${totalTime}ms`);
      console.log(`📊 Response length: ${fullResponse.length} characters`);
      break;
    }
  }
}
```

---

## Web Service Integration

### Express.js Integration

```typescript
import express from 'express';
import cors from 'cors';

async function expressIntegration() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Initialize unified indexer
  const service = await createUnifiedIndexerService(createProductionConfig());
  const startedService = await startUnifiedIndexerService(service);
  const searchEngine = createCrossDomainSearchEngine(startedService);

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const status = getServiceStatus(startedService);
      const health = await startedService.unifiedClient.healthCheck();

      res.json({
        status: 'healthy',
        service: status,
        storage: health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Search endpoint
  app.post('/search', async (req, res) => {
    try {
      const { query, options = {} } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const results = await search(searchEngine, {
        query,
        limit: options.limit || 20,
        semantic: options.semantic !== false,
        includeAnalytics: options.includeAnalytics || false,
        ...options,
      });

      res.json({
        success: true,
        results: results.results,
        total: results.total,
        took: results.took,
        analytics: results.analytics,
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Context endpoint
  app.post('/context', async (req, res) => {
    try {
      const { queries, options = {} } = req.body;

      if (!queries || !Array.isArray(queries)) {
        return res.status(400).json({ error: 'Queries array is required' });
      }

      const { searchResults, context } = await getContextualSearch(searchEngine, queries, {
        limit: options.limit || 20,
        semantic: options.semantic !== false,
        formatForLLM: true,
        contextLimit: options.contextLimit || 10,
        ...options,
      });

      res.json({
        success: true,
        context,
        searchResults: {
          results: searchResults.results,
          total: searchResults.total,
          analytics: searchResults.analytics,
        },
      });
    } catch (error) {
      console.error('Context error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Indexing status endpoint
  app.get('/indexing/status', async (req, res) => {
    try {
      const status = getServiceStatus(startedService);
      const stats = startedService.stats;

      res.json({
        status,
        stats: {
          unified: stats.unified,
          fileIndexing: stats.fileIndexing,
          discordIndexing: stats.discordIndexing,
          opencodeIndexing: stats.opencodeIndexing,
          kanbanIndexing: stats.kanbanIndexing,
        },
        lastSync: new Date(status.lastSync).toISOString(),
        nextSync: new Date(status.nextSync).toISOString(),
      });
    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Unified indexer API running on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down Express server...');
    await stopUnifiedIndexerService(startedService);
    process.exit(0);
  });
}
```

### Fastify Integration

```typescript
import Fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';

async function fastifyIntegration() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(fastifyCors, {
    origin: true,
  });

  // Initialize unified indexer
  const service = await createUnifiedIndexerService(createProductionConfig());
  const startedService = await startUnifiedIndexerService(service);
  const searchEngine = createCrossDomainSearchEngine(startedService);

  // Health check
  fastify.get('/health', async (request, reply) => {
    try {
      const status = getServiceStatus(startedService);
      const health = await startedService.unifiedClient.healthCheck();

      return {
        status: 'healthy',
        service: status,
        storage: health,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Search endpoint
  fastify.post(
    '/search',
    {
      schema: {
        body: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            semantic: { type: 'boolean' },
            includeAnalytics: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { query, options = {} } = request.body as any;

        const results = await search(searchEngine, {
          query,
          limit: options.limit || 20,
          semantic: options.semantic !== false,
          includeAnalytics: options.includeAnalytics || false,
          ...options,
        });

        return {
          success: true,
          results: results.results,
          total: results.total,
          took: results.took,
          analytics: results.analytics,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  );

  // Context endpoint
  fastify.post(
    '/context',
    {
      schema: {
        body: {
          type: 'object',
          required: ['queries'],
          properties: {
            queries: { type: 'array', items: { type: 'string' } },
            limit: { type: 'number', minimum: 1, maximum: 50 },
            contextLimit: { type: 'number', minimum: 1, maximum: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { queries, options = {} } = request.body as any;

        const { searchResults, context } = await getContextualSearch(searchEngine, queries, {
          limit: options.limit || 20,
          semantic: options.semantic !== false,
          formatForLLM: true,
          contextLimit: options.contextLimit || 10,
          ...options,
        });

        return {
          success: true,
          context,
          searchResults: {
            results: searchResults.results,
            total: searchResults.total,
            analytics: searchResults.analytics,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  );

  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: '0.0.0.0' });
    console.log('🚀 Fastify server listening');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
```

---

## Microservices Integration

### Service Mesh Integration

```typescript
import {
  createUnifiedIndexerService,
  createCrossDomainSearchEngine,
} from '@promethean-os/unified-indexer';

class UnifiedIndexerMicroservice {
  private service: UnifiedIndexerServiceState;
  private searchEngine: CrossDomainSearchEngineState;
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async initialize(config: UnifiedIndexerServiceConfig) {
    console.log(`🚀 Initializing ${this.serviceName} microservice...`);

    // Create unified indexer service
    this.service = await createUnifiedIndexerService(config);
    await startUnifiedIndexerService(this.service);

    // Create search engine
    this.searchEngine = createCrossDomainSearchEngine(this.service, {
      semantic: true,
      timeBoost: true,
      includeAnalytics: true,
    });

    console.log(`✅ ${this.serviceName} microservice initialized`);
  }

  async search(query: string, options: any = {}) {
    try {
      const results = await search(this.searchEngine, {
        query,
        limit: options.limit || 20,
        semantic: options.semantic !== false,
        includeAnalytics: options.includeAnalytics || false,
        ...options,
      });

      return {
        service: this.serviceName,
        success: true,
        results: results.results,
        total: results.total,
        took: results.took,
        analytics: results.analytics,
      };
    } catch (error) {
      console.error(`❌ ${this.serviceName} search error:`, error);
      return {
        service: this.serviceName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getContext(queries: string[], options: any = {}) {
    try {
      const { searchResults, context } = await getContextualSearch(this.searchEngine, queries, {
        limit: options.limit || 20,
        semantic: options.semantic !== false,
        formatForLLM: true,
        contextLimit: options.contextLimit || 10,
        ...options,
      });

      return {
        service: this.serviceName,
        success: true,
        context,
        searchResults: {
          results: searchResults.results,
          total: searchResults.total,
          analytics: searchResults.analytics,
        },
      };
    } catch (error) {
      console.error(`❌ ${this.serviceName} context error:`, error);
      return {
        service: this.serviceName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStatus() {
    try {
      const status = getServiceStatus(this.service);
      const health = await this.service.unifiedClient.healthCheck();

      return {
        service: this.serviceName,
        status: 'healthy',
        serviceStatus: status,
        storageHealth: health,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: this.serviceName,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async shutdown() {
    console.log(`🛑 Shutting down ${this.serviceName} microservice...`);
    await stopUnifiedIndexerService(this.service);
    console.log(`✅ ${this.serviceName} microservice shut down`);
  }
}

// Usage example
async function setupMicroservices() {
  // Create multiple microservice instances
  const searchService = new UnifiedIndexerMicroservice('unified-search');
  const contextService = new UnifiedIndexerMicroservice('unified-context');
  const analyticsService = new UnifiedIndexerMicroservice('unified-analytics');

  // Initialize with different configurations
  await searchService.initialize(createProductionConfig());
  await contextService.initialize(createProductionConfig());
  await analyticsService.initialize(createProductionConfig());

  // Use services
  const searchResults = await searchService.search('TypeScript patterns');
  const contextResults = await contextService.getContext(['architecture', 'design']);
  const statusResults = await analyticsService.getStatus();

  console.log('Search results:', searchResults);
  console.log('Context results:', contextResults);
  console.log('Status results:', statusResults);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await Promise.all([
      searchService.shutdown(),
      contextService.shutdown(),
      analyticsService.shutdown(),
    ]);
    process.exit(0);
  });
}
```

---

## Migration Patterns

### From Individual Indexers

```typescript
async function migrateFromIndividualIndexers() {
  // Old approach: Multiple separate indexers
  console.log('🔄 Migrating from individual indexers...');

  // Step 1: Create unified configuration
  const unifiedConfig = createProductionConfig();

  // Step 2: Initialize unified service
  const unifiedService = await createUnifiedIndexerService(unifiedConfig);
  await startUnifiedIndexerService(unifiedService);

  // Step 3: Create search engine
  const searchEngine = createCrossDomainSearchEngine(unifiedService);

  // Step 4: Test migration with comparison queries
  const migrationQueries = ['file system indexing', 'search implementation', 'context compilation'];

  for (const query of migrationQueries) {
    console.log(`\n🔍 Testing migration for: "${query}"`);

    // New unified search
    const unifiedResults = await search(searchEngine, {
      query,
      limit: 15,
      semantic: true,
      includeAnalytics: true,
    });

    console.log(`✅ Unified results: ${unifiedResults.results.length} items`);
    console.log(`   Sources: ${unifiedResults.analytics?.sourcesSearched.join(', ')}`);
    console.log(`   Types: ${unifiedResults.analytics?.typesFound.join(', ')}`);
    console.log(`   Avg score: ${unifiedResults.analytics?.averageScore.toFixed(3)}`);

    // Show top results
    unifiedResults.results.slice(0, 3).forEach((result, index) => {
      console.log(
        `   ${index + 1}. [${result.content.source}:${result.content.type}] ${result.score.toFixed(3)}`,
      );
    });
  }

  // Step 5: Performance comparison
  console.log('\n⚡ Performance comparison...');
  const startTime = Date.now();

  const performanceResults = await search(searchEngine, {
    query: 'performance optimization',
    limit: 50,
    semantic: true,
    includeAnalytics: true,
  });

  const totalTime = Date.now() - startTime;

  console.log(`Search performance: ${performanceResults.results.length} results in ${totalTime}ms`);
  console.log(
    `Average per result: ${(totalTime / performanceResults.results.length).toFixed(1)}ms`,
  );

  return { unifiedService, searchEngine };
}
```

### Gradual Migration Strategy

```typescript
async function gradualMigration() {
  console.log('🔄 Starting gradual migration...');

  // Phase 1: Parallel operation
  console.log('\n📋 Phase 1: Parallel operation');

  const unifiedConfig = createProductionConfig();

  // Start with limited sources
  const phase1Config = {
    ...unifiedConfig,
    sources: {
      files: {
        enabled: true,
        paths: ['./src'],
        options: { includePatterns: ['*.ts', '*.js'] },
      },
      discord: { enabled: false },
      opencode: { enabled: false },
      kanban: { enabled: false },
    },
  };

  const unifiedService = await createUnifiedIndexerService(phase1Config);
  await startUnifiedIndexerService(unifiedService);

  // Test phase 1
  const searchEngine = createCrossDomainSearchEngine(unifiedService);
  const phase1Results = await search(searchEngine, {
    query: 'TypeScript implementation',
    limit: 10,
  });

  console.log(`Phase 1 results: ${phase1Results.results.length} items`);

  // Phase 2: Add more sources
  console.log('\n📋 Phase 2: Adding more sources');

  const phase2Config = {
    ...unifiedConfig,
    sources: {
      files: {
        enabled: true,
        paths: ['./src', './docs'],
        options: { includePatterns: ['*.ts', '*.js', '*.md'] },
      },
      discord: { enabled: true },
      opencode: { enabled: false },
      kanban: { enabled: false },
    },
  };

  // Update service (would need restart in real implementation)
  await stopUnifiedIndexerService(unifiedService);
  const updatedService = await createUnifiedIndexerService(phase2Config);
  await startUnifiedIndexerService(updatedService);

  const updatedSearchEngine = createCrossDomainSearchEngine(updatedService);
  const phase2Results = await search(updatedSearchEngine, {
    query: 'TypeScript implementation',
    limit: 10,
  });

  console.log(`Phase 2 results: ${phase2Results.results.length} items`);
  console.log(`Sources: ${phase2Results.analytics?.sourcesSearched.join(', ')}`);

  // Phase 3: Full migration
  console.log('\n📋 Phase 3: Full migration');

  await stopUnifiedIndexerService(updatedService);
  const fullService = await createUnifiedIndexerService(unifiedConfig);
  await startUnifiedIndexerService(fullService);

  const fullSearchEngine = createCrossDomainSearchEngine(fullService);
  const phase3Results = await search(fullSearchEngine, {
    query: 'TypeScript implementation',
    limit: 10,
  });

  console.log(`Phase 3 results: ${phase3Results.results.length} items`);
  console.log(`Sources: ${phase3Results.analytics?.sourcesSearched.join(', ')}`);

  // Migration summary
  console.log('\n📊 Migration summary:');
  console.log(`Phase 1 (files only): ${phase1Results.results.length} results`);
  console.log(`Phase 2 (files + discord): ${phase2Results.results.length} results`);
  console.log(`Phase 3 (all sources): ${phase3Results.results.length} results`);

  return { fullService, fullSearchEngine };
}
```

---

This integration guide provides comprehensive patterns for integrating unified-indexer with various systems and architectures. Each integration pattern includes practical examples and best practices for production deployment.
