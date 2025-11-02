# Usage Examples - @promethean-os/unified-indexer

This document provides comprehensive, practical examples for using the unified-indexer package in various scenarios. All examples are copy-paste ready and include error handling.

## Table of Contents

- [Basic Setup](#basic-setup)
- [File Indexing](#file-indexing)
- [Search Operations](#search-operations)
- [Context Compilation](#context-compilation)
- [Advanced Search](#advanced-search)
- [Integration Patterns](#integration-patterns)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Real-World Scenarios](#real-world-scenarios)

---

## Basic Setup

### Minimal Configuration

```typescript
import {
  createUnifiedIndexerService,
  startUnifiedIndexerService,
  createCrossDomainSearchEngine,
} from '@promethean-os/unified-indexer';

// Basic configuration for development
const basicConfig = {
  indexing: {
    vectorStore: {
      type: 'chromadb' as const,
      connectionString: 'http://localhost:8000',
      indexName: 'promethean-dev',
    },
    metadataStore: {
      type: 'mongodb' as const,
      connectionString: 'mongodb://localhost:27017',
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 50,
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
    interval: 60000, // 1 minute for development
    batchSize: 50,
    retryAttempts: 3,
    retryDelay: 1000,
  },
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
};

async function basicSetup() {
  try {
    // Create and start service
    const service = await createUnifiedIndexerService(basicConfig);
    const startedService = await startUnifiedIndexerService(service);

    // Create search engine
    const searchEngine = createCrossDomainSearchEngine(startedService);

    console.log('✅ Unified indexer service started successfully');
    return { service: startedService, searchEngine };
  } catch (error) {
    console.error('❌ Failed to setup unified indexer:', error);
    throw error;
  }
}
```

### Production Configuration

```typescript
import type { UnifiedIndexerServiceConfig } from '@promethean-os/unified-indexer';

function createProductionConfig(): UnifiedIndexerServiceConfig {
  return {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: process.env.CHROMA_DB_URL || 'http://chroma:8000',
        indexName: process.env.CHROMA_INDEX || 'promethean-production',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: process.env.MONGODB_URL || 'mongodb://mongo:27017/promethean',
      },
      embedding: {
        model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
        dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536'),
        batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE || '100'),
      },
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
      },
      validation: {
        strict: true,
        skipVectorValidation: false,
        maxContentLength: 1000000, // 1MB
      },
    },
    sources: {
      files: {
        enabled: true,
        paths: (process.env.INDEX_PATHS || './src,./docs,./packages').split(','),
        options: {
          batchSize: parseInt(process.env.FILE_BATCH_SIZE || '100'),
          excludePatterns: [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            '*.log',
            '.env*',
            'coverage/**',
          ],
          includePatterns: ['*.ts', '*.js', '*.tsx', '*.jsx', '*.md', '*.json', '*.yaml', '*.yml'],
          maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
          followSymlinks: false,
        },
      },
      discord: {
        enabled: process.env.DISCORD_ENABLED === 'true',
        provider: process.env.DISCORD_PROVIDER,
        tenant: process.env.DISCORD_TENANT,
      },
      opencode: {
        enabled: process.env.OPENCODE_ENABLED === 'true',
        sessionId: process.env.OPENCODE_SESSION_ID,
      },
      kanban: {
        enabled: process.env.KANBAN_ENABLED === 'true',
        boardId: process.env.KANBAN_BOARD_ID,
      },
    },
    sync: {
      interval: parseInt(process.env.SYNC_INTERVAL || '300000'), // 5 minutes
      batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100'),
      retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.SYNC_RETRY_DELAY || '5000'),
    },
    contextStore: {
      collections: {
        files: 'files',
        discord: 'discord',
        opencode: 'opencode',
        kanban: 'kanban',
        unified: 'unified',
      },
      formatTime: (ms: number) => new Date(ms).toISOString(),
      assistantName: process.env.ASSISTANT_NAME || 'Promethean',
    },
  };
}

async function productionSetup() {
  const config = createProductionConfig();

  try {
    const service = await createUnifiedIndexerService(config);
    const startedService = await startUnifiedIndexerService(service);
    const searchEngine = createCrossDomainSearchEngine(startedService, {
      semantic: true,
      timeBoost: true,
      includeAnalytics: true,
    });

    console.log('🚀 Production unified indexer service started');
    return { service: startedService, searchEngine };
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    process.exit(1);
  }
}
```

---

## File Indexing

### Index a Single Directory

```typescript
import { createUnifiedFileIndexer } from '@promethean-os/unified-indexer';
import type { UnifiedIndexingClient } from '@promethean-os/persistence';

async function indexSingleDirectory(client: UnifiedIndexingClient) {
  const fileIndexer = createUnifiedFileIndexer(client);

  try {
    console.log('📁 Starting directory indexing...');

    const stats = await fileIndexer.indexDirectory('./src', {
      batchSize: 50,
      excludePatterns: ['node_modules/**', '.git/**', 'dist/**'],
      includePatterns: ['*.ts', '*.js', '*.md'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      followSymlinks: false,
    });

    console.log('✅ Directory indexing completed:', {
      totalFiles: stats.totalFiles,
      indexedFiles: stats.indexedFiles,
      skippedFiles: stats.skippedFiles,
      errors: stats.errors.length,
      duration: `${stats.duration}ms`,
    });

    if (stats.errors.length > 0) {
      console.warn('⚠️ Indexing errors:', stats.errors);
    }

    return stats;
  } catch (error) {
    console.error('❌ Directory indexing failed:', error);
    throw error;
  }
}
```

### Index Multiple Directories

```typescript
async function indexMultipleDirectories(client: UnifiedIndexingClient) {
  const fileIndexer = createUnifiedFileIndexer(client);
  const directories = ['./src', './docs', './packages'];

  const results = await Promise.allSettled(
    directories.map(async (dir) => {
      console.log(`📁 Indexing directory: ${dir}`);
      return fileIndexer.indexDirectory(dir, {
        batchSize: 100,
        excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
        includePatterns: ['*.ts', '*.js', '*.md', '*.json'],
      });
    }),
  );

  let totalFiles = 0;
  let totalIndexed = 0;
  let totalErrors = 0;

  results.forEach((result, index) => {
    const dir = directories[index];
    if (result.status === 'fulfilled') {
      const stats = result.value;
      console.log(`✅ ${dir}: ${stats.indexedFiles}/${stats.totalFiles} files indexed`);
      totalFiles += stats.totalFiles;
      totalIndexed += stats.indexedFiles;
      totalErrors += stats.errors.length;
    } else {
      console.error(`❌ ${dir}: Failed to index`, result.reason);
    }
  });

  console.log('📊 Overall indexing summary:', {
    totalDirectories: directories.length,
    totalFiles,
    totalIndexed,
    totalErrors,
    successRate: `${((totalIndexed / totalFiles) * 100).toFixed(1)}%`,
  });

  return { totalFiles, totalIndexed, totalErrors };
}
```

### Selective File Indexing

```typescript
async function selectiveIndexing(client: UnifiedIndexingClient) {
  const fileIndexer = createUnifiedFileIndexer(client);

  // Index only TypeScript files in src directory
  const typescriptStats = await fileIndexer.indexDirectory('./src', {
    includePatterns: ['*.ts', '*.tsx'],
    excludePatterns: ['*.test.ts', '*.spec.ts', 'node_modules/**'],
  });

  // Index only documentation files
  const docsStats = await fileIndexer.indexDirectory('./docs', {
    includePatterns: ['*.md', '*.mdx'],
    excludePatterns: ['node_modules/**', '.git/**'],
  });

  // Index configuration files
  const configStats = await fileIndexer.indexDirectory('./', {
    includePatterns: ['package.json', 'tsconfig.json', '*.config.js', '*.config.ts'],
    maxFileSize: 1024 * 1024, // 1MB for config files
  });

  console.log('📋 Selective indexing results:', {
    typescript: `${typescriptStats.indexedFiles}/${typescriptStats.totalFiles}`,
    documentation: `${docsStats.indexedFiles}/${docsStats.totalFiles}`,
    configuration: `${configStats.indexedFiles}/${configStats.totalFiles}`,
  });

  return { typescriptStats, docsStats, configStats };
}
```

---

## Search Operations

### Basic Search

```typescript
import { search } from '@promethean-os/unified-indexer';
import type { CrossDomainSearchEngineState } from '@promethean-os/unified-indexer';

async function basicSearch(searchEngine: CrossDomainSearchEngineState) {
  try {
    console.log('🔍 Performing basic search...');

    const results = await search(searchEngine, {
      query: 'TypeScript contextStore implementation',
      limit: 10,
      semantic: true,
    });

    console.log(`✅ Found ${results.results.length} results in ${results.took}ms`);

    results.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.content.id}`);
      console.log(`   Score: ${result.score.toFixed(3)}`);
      console.log(`   Source: ${result.content.source}`);
      console.log(`   Type: ${result.content.type}`);
      console.log(`   Preview: ${result.content.content.substring(0, 100)}...`);
      console.log('');
    });

    return results;
  } catch (error) {
    console.error('❌ Search failed:', error);
    throw error;
  }
}
```

### Advanced Search with Filters

```typescript
async function advancedSearch(searchEngine: CrossDomainSearchEngineState) {
  try {
    console.log('🔍 Performing advanced search with filters...');

    const results = await search(searchEngine, {
      query: 'unified indexer architecture',
      type: ['file', 'document'],
      source: ['filesystem'],
      limit: 20,
      semantic: true,
      fuzzy: true,
      timeBoost: true,
      recencyDecay: 48, // 48 hours
      deduplicate: true,
      groupBySource: true,
      maxResultsPerSource: 10,
      includeAnalytics: true,
      explainScores: true,
    });

    console.log(`✅ Advanced search completed: ${results.results.length} results`);

    // Display analytics
    if (results.analytics) {
      console.log('📊 Search Analytics:', {
        sourcesSearched: results.analytics.sourcesSearched,
        typesFound: results.analytics.typesFound,
        averageScore: results.analytics.averageScore.toFixed(3),
        temporalRange: {
          oldest: new Date(results.analytics.temporalRange.oldest).toISOString(),
          newest: new Date(results.analytics.temporalRange.newest).toISOString(),
          span: `${Math.round(results.analytics.temporalRange.span / 1000 / 60)} minutes`,
        },
      });
    }

    // Display results with explanations
    results.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.content.id}`);
      console.log(`   Score: ${result.score.toFixed(3)}`);
      console.log(`   Age: ${Math.round(result.age / 1000 / 60)} minutes`);
      console.log(`   Recency Score: ${result.recencyScore.toFixed(3)}`);

      if (result.explanation) {
        console.log(`   Explanation: ${result.explanation}`);
      }

      if (result.scoreBreakdown) {
        console.log(`   Score Breakdown:`, result.scoreBreakdown);
      }

      console.log(`   Preview: ${result.content.content.substring(0, 150)}...`);
      console.log('');
    });

    return results;
  } catch (error) {
    console.error('❌ Advanced search failed:', error);
    throw error;
  }
}
```

### Intelligent Search with Query Expansion

```typescript
import { intelligentSearch } from '@promethean-os/unified-indexer';

async function intelligentSearchExample(searchEngine: CrossDomainSearchEngineState) {
  const queries = [
    'indexing service implementation',
    'contextStore integration',
    'cross-domain search patterns',
    'vector database optimization',
  ];

  for (const query of queries) {
    try {
      console.log(`🧠 Performing intelligent search for: "${query}"`);

      const results = await intelligentSearch(searchEngine, query, {
        limit: 15,
        includeAnalytics: true,
        timeBoost: true,
        sourceWeights: {
          filesystem: 1.3,
          opencode: 1.1,
        },
      });

      console.log(`✅ Found ${results.results.length} enhanced results`);

      // Show top 3 results with highest scores
      const topResults = results.results.slice(0, 3);
      topResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.content.id} (${result.score.toFixed(3)})`);
        console.log(`     ${result.content.content.substring(0, 80)}...`);
      });

      console.log('');
    } catch (error) {
      console.error(`❌ Intelligent search failed for "${query}":`, error);
    }
  }
}
```

---

## Context Compilation

### Basic Context for LLM

```typescript
import { getContextualSearch } from '@promethean-os/unified-indexer';

async function basicContextCompilation(searchEngine: CrossDomainSearchEngineState) {
  try {
    console.log('🤖 Compiling context for LLM...');

    const { searchResults, context } = await getContextualSearch(
      searchEngine,
      ['unified indexer', 'contextStore', 'cross-domain search'],
      {
        limit: 20,
        semantic: true,
        formatForLLM: true,
        contextLimit: 10,
        timeBoost: true,
      },
    );

    console.log(
      `✅ Generated ${context.length} context messages from ${searchResults.results.length} search results`,
    );

    // Display context messages
    context.forEach((message, index) => {
      if (message && typeof message === 'object' && 'role' in message) {
        const msg = message as { role?: string; content?: string };
        console.log(
          `${index + 1}. [${msg.role || 'unknown'}] ${msg.content?.substring(0, 100)}...`,
        );
      }
    });

    return { searchResults, context };
  } catch (error) {
    console.error('❌ Context compilation failed:', error);
    throw error;
  }
}
```

### Context with Specific Formatting

```typescript
async function formattedContextCompilation(searchEngine: CrossDomainSearchEngineState) {
  try {
    console.log('📝 Compiling formatted context...');

    const { searchResults, context } = await getContextualSearch(
      searchEngine,
      ['TypeScript implementation patterns', 'error handling best practices'],
      {
        limit: 15,
        semantic: true,
        formatForLLM: true,
        contextLimit: 8,
        sourceWeights: {
          filesystem: 1.5, // Boost file system content
          opencode: 1.2, // Boost code examples
        },
        typeWeights: {
          file: 1.3, // Boost files
          document: 1.1, // Boost documentation
        },
        includeAnalytics: true,
      },
    );

    console.log(`📊 Context compilation summary:`);
    console.log(`   Search results: ${searchResults.results.length}`);
    console.log(`   Context messages: ${context.length}`);
    console.log(`   Sources used: ${searchResults.analytics?.sourcesSearched.join(', ')}`);
    console.log(`   Content types: ${searchResults.analytics?.typesFound.join(', ')}`);

    // Format context for specific LLM usage
    const formattedContext = context
      .map((msg, index) => {
        if (msg && typeof msg === 'object' && 'role' in msg && 'content' in msg) {
          const message = msg as { role: string; content: string };
          return {
            index: index + 1,
            role: message.role,
            content: message.content,
            length: message.content.length,
            preview: message.content.substring(0, 60),
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log('\n📋 Formatted context messages:');
    formattedContext.forEach((msg: any) => {
      console.log(`${msg.index}. [${msg.role}] (${msg.length} chars) ${msg.preview}...`);
    });

    return { searchResults, context, formattedContext };
  } catch (error) {
    console.error('❌ Formatted context compilation failed:', error);
    throw error;
  }
}
```

### Context for Different Use Cases

```typescript
async function contextualSearchForUseCases(searchEngine: CrossDomainSearchEngineState) {
  const useCases = [
    {
      name: 'Code Implementation',
      queries: ['TypeScript class implementation', 'interface design patterns'],
      options: {
        type: ['file'],
        sourceWeights: { filesystem: 1.5 },
        contextLimit: 12,
      },
    },
    {
      name: 'Documentation Review',
      queries: ['API documentation', 'usage examples', 'best practices'],
      options: {
        type: ['document', 'file'],
        sourceWeights: { filesystem: 1.2 },
        contextLimit: 8,
      },
    },
    {
      name: 'Troubleshooting',
      queries: ['error handling', 'debugging', 'common issues'],
      options: {
        timeBoost: true,
        recencyDecay: 24, // Recent content
        contextLimit: 10,
      },
    },
  ];

  for (const useCase of useCases) {
    try {
      console.log(`\n🎯 Context compilation for: ${useCase.name}`);

      const { searchResults, context } = await getContextualSearch(searchEngine, useCase.queries, {
        limit: 20,
        semantic: true,
        formatForLLM: true,
        includeAnalytics: true,
        ...useCase.options,
      });

      console.log(`   Results: ${searchResults.results.length}`);
      console.log(`   Context: ${context.length} messages`);
      console.log(`   Avg score: ${searchResults.analytics?.averageScore.toFixed(3)}`);

      // Show context preview
      context.slice(0, 3).forEach((msg, index) => {
        if (msg && typeof msg === 'object' && 'content' in msg) {
          const message = msg as { content: string };
          console.log(`     ${index + 1}. ${message.content.substring(0, 50)}...`);
        }
      });
    } catch (error) {
      console.error(`❌ Failed to compile context for ${useCase.name}:`, error);
    }
  }
}
```

---

## Advanced Search

### Multi-Query Search

```typescript
async function multiQuerySearch(searchEngine: CrossDomainSearchEngineState) {
  const querySets = [
    {
      name: 'Architecture Overview',
      queries: ['unified indexer', 'service architecture', 'data flow'],
      options: { limit: 15, semantic: true },
    },
    {
      name: 'Implementation Details',
      queries: ['TypeScript implementation', 'class design', 'interface patterns'],
      options: { limit: 20, type: ['file'], sourceWeights: { filesystem: 1.3 } },
    },
    {
      name: 'Performance Optimization',
      queries: ['performance', 'optimization', 'caching', 'batch processing'],
      options: { limit: 10, timeBoost: true, recencyDecay: 48 },
    },
  ];

  const allResults = [];

  for (const querySet of querySets) {
    try {
      console.log(`\n🔍 Multi-query search: ${querySet.name}`);

      const results = await search(searchEngine, {
        query: querySet.queries.join(' '),
        ...querySet.options,
        includeAnalytics: true,
        explainScores: true,
      });

      console.log(`   Found ${results.results.length} results`);

      // Add metadata to results
      const enhancedResults = results.results.map((result) => ({
        ...result,
        querySet: querySet.name,
        searchTime: results.took,
      }));

      allResults.push(...enhancedResults);
    } catch (error) {
      console.error(`❌ Multi-query search failed for ${querySet.name}:`, error);
    }
  }

  // Deduplicate and sort all results
  const uniqueResults = Array.from(
    new Map(allResults.map((result) => [result.content.id, result])).values(),
  ).sort((a, b) => b.score - a.score);

  console.log(`\n📊 Multi-query summary: ${uniqueResults.length} unique results`);

  // Show top results from different query sets
  const topResults = uniqueResults.slice(0, 10);
  topResults.forEach((result, index) => {
    console.log(
      `${index + 1}. [${result.querySet}] ${result.content.id} (${result.score.toFixed(3)})`,
    );
  });

  return uniqueResults;
}
```

### Real-time Search Monitoring

```typescript
async function realTimeSearchMonitoring(searchEngine: CrossDomainSearchEngineState) {
  const searchQueries = [
    'contextStore',
    'unified indexer',
    'TypeScript patterns',
    'search implementation',
    'vector database',
  ];

  const performanceMetrics = [];

  console.log('⏱️ Starting real-time search monitoring...');

  for (const query of searchQueries) {
    const startTime = Date.now();

    try {
      const results = await search(searchEngine, {
        query,
        limit: 10,
        semantic: true,
        includeAnalytics: true,
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const metrics = {
        query,
        totalTime,
        apiTime: results.took,
        overhead: totalTime - results.took,
        resultCount: results.results.length,
        averageScore: results.analytics?.averageScore || 0,
        sourcesSearched: results.analytics?.sourcesSearched.length || 0,
      };

      performanceMetrics.push(metrics);

      console.log(
        `🔍 "${query}": ${metrics.resultCount} results in ${totalTime}ms (API: ${results.took}ms)`,
      );
    } catch (error) {
      console.error(`❌ Search failed for "${query}":`, error);
    }

    // Small delay between searches
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Performance analysis
  const avgTotalTime =
    performanceMetrics.reduce((sum, m) => sum + m.totalTime, 0) / performanceMetrics.length;
  const avgApiTime =
    performanceMetrics.reduce((sum, m) => sum + m.apiTime, 0) / performanceMetrics.length;
  const avgOverhead =
    performanceMetrics.reduce((sum, m) => sum + m.overhead, 0) / performanceMetrics.length;

  console.log('\n📊 Performance Summary:');
  console.log(`   Average total time: ${avgTotalTime.toFixed(1)}ms`);
  console.log(`   Average API time: ${avgApiTime.toFixed(1)}ms`);
  console.log(`   Average overhead: ${avgOverhead.toFixed(1)}ms`);
  console.log(`   Overhead percentage: ${((avgOverhead / avgTotalTime) * 100).toFixed(1)}%`);

  return performanceMetrics;
}
```

### Search with Custom Scoring

```typescript
async function customScoringSearch(searchEngine: CrossDomainSearchEngineState) {
  try {
    console.log('⚖️ Performing search with custom scoring...');

    const results = await search(searchEngine, {
      query: 'unified indexer service implementation',
      limit: 20,
      semantic: true,
      timeBoost: true,
      includeAnalytics: true,
      explainScores: true,

      // Custom source weights
      sourceWeights: {
        filesystem: 1.5, // Boost file system content
        discord: 0.8, // Lower priority for Discord
        opencode: 1.3, // Boost OpenCode content
        kanban: 1.0, // Normal priority for Kanban
        agent: 1.2, // Boost agent-generated content
        user: 1.0, // Normal priority for user content
        system: 0.9, // Slightly lower for system content
        external: 0.7, // Lowest for external content
      },

      // Custom type weights
      typeWeights: {
        file: 1.4, // Boost files
        document: 1.2, // Boost documentation
        message: 0.9, // Lower for messages
        task: 1.3, // Boost tasks
        event: 0.8, // Lower for events
        session: 1.1, // Slight boost for sessions
        attachment: 0.7, // Lowest for attachments
        thought: 1.2, // Boost thoughts/analysis
        board: 1.0, // Normal for boards
      },

      // Temporal settings
      recencyDecay: 72, // 72 hours for recency decay

      // Result processing
      deduplicate: true,
      groupBySource: true,
      maxResultsPerSource: 8,
    });

    console.log(`✅ Custom scoring search: ${results.results.length} results`);

    // Analyze score distribution
    const scores = results.results.map((r) => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    console.log('📊 Score Analysis:');
    console.log(`   Average: ${avgScore.toFixed(3)}`);
    console.log(`   Range: ${minScore.toFixed(3)} - ${maxScore.toFixed(3)}`);
    console.log(
      `   Standard deviation: ${Math.sqrt(scores.reduce((sq, n) => sq + Math.pow(n - avgScore, 2), 0) / scores.length).toFixed(3)}`,
    );

    // Show results with score breakdowns
    results.results.slice(0, 5).forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.content.id}`);
      console.log(`   Final Score: ${result.score.toFixed(3)}`);

      if (result.scoreBreakdown) {
        const breakdown = result.scoreBreakdown;
        console.log(`   Components:`);
        console.log(`     Semantic: ${breakdown.semantic.toFixed(3)}`);
        console.log(`     Keyword: ${breakdown.keyword.toFixed(3)}`);
        console.log(`     Temporal: ${breakdown.temporal.toFixed(3)}`);
        console.log(`     Source: ${breakdown.source.toFixed(2)}`);
        console.log(`     Type: ${breakdown.type.toFixed(2)}`);
      }

      if (result.explanation) {
        console.log(`   Explanation: ${result.explanation}`);
      }
    });

    return results;
  } catch (error) {
    console.error('❌ Custom scoring search failed:', error);
    throw error;
  }
}
```

---

## Integration Patterns

### Integration with Express.js

```typescript
import express from 'express';
import {
  createUnifiedIndexerService,
  startUnifiedIndexerService,
  createCrossDomainSearchEngine,
} from '@promethean-os/unified-indexer';

async function createSearchServer() {
  const app = express();
  app.use(express.json());

  // Initialize unified indexer
  const config = createProductionConfig();
  const service = await createUnifiedIndexerService(config);
  const startedService = await startUnifiedIndexerService(service);
  const searchEngine = createCrossDomainSearchEngine(startedService);

  // Health check endpoint
  app.get('/health', (req, res) => {
    const status = getServiceStatus(startedService);
    res.json({
      status: 'healthy',
      service: status,
      timestamp: new Date().toISOString(),
    });
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
        limit: 20,
        semantic: true,
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
        limit: 15,
        formatForLLM: true,
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Search server running on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down search server...');
    await stopUnifiedIndexerService(startedService);
    process.exit(0);
  });
}
```

### Integration with LLM Client

```typescript
async function llmIntegration(searchEngine: CrossDomainSearchEngineState) {
  // Mock LLM client - replace with actual implementation
  class MockLLMClient {
    async chat(params: { messages: Array<{ role: string; content: string }> }) {
      // Simulate LLM response
      return {
        role: 'assistant',
        content: `Based on the provided context, I can help you understand the unified indexer system. The context contains ${params.messages.length} messages with information about indexing, search, and context compilation.`,
      };
    }
  }

  const llmClient = new MockLLMClient();

  const userQueries = [
    'How does the unified indexer work?',
    'What are the main components?',
    'How do I integrate it with my application?',
  ];

  for (const userQuery of userQueries) {
    try {
      console.log(`\n🤖 User Query: "${userQuery}"`);

      // Get relevant context
      const { context } = await getContextualSearch(searchEngine, [userQuery], {
        limit: 10,
        semantic: true,
        formatForLLM: true,
        contextLimit: 8,
        timeBoost: true,
      });

      console.log(`📚 Retrieved ${context.length} context messages`);

      // Build conversation
      const messages = [
        {
          role: 'system',
          content:
            'You are a helpful assistant specializing in the Promethean OS unified indexer system.',
        },
        ...context,
        { role: 'user', content: userQuery },
      ];

      // Get LLM response
      const startTime = Date.now();
      const llmResponse = await llmClient.chat({ messages });
      const responseTime = Date.now() - startTime;

      console.log(`💬 LLM Response (${responseTime}ms):`);
      console.log(llmResponse.content);
    } catch (error) {
      console.error(`❌ Failed to process query "${userQuery}":`, error);
    }
  }
}
```

### Background Indexing Service

```typescript
async function backgroundIndexingService() {
  const config = createProductionConfig();
  const service = await createUnifiedIndexerService(config);
  const startedService = await startUnifiedIndexerService(service);

  console.log('🔄 Background indexing service started');

  // Monitor indexing progress
  const monitoringInterval = setInterval(async () => {
    try {
      const status = getServiceStatus(startedService);
      const stats = startedService.stats;

      console.log('📊 Indexing Status:', {
        healthy: status.healthy,
        indexing: status.indexing,
        lastSync: new Date(status.lastSync).toISOString(),
        nextSync: new Date(status.nextSync).toISOString(),
        activeSources: status.activeSources,
      });

      console.log('📈 Statistics:', {
        totalContent: stats.unified.total.totalContent,
        fileIndexing: `${stats.fileIndexing.indexedFiles}/${stats.fileIndexing.totalFiles}`,
        errors: stats.unified.errors.length,
      });

      // Check for issues
      if (status.issues.length > 0) {
        console.warn('⚠️ Service issues:', status.issues);
      }
    } catch (error) {
      console.error('❌ Monitoring error:', error);
    }
  }, 30000); // Every 30 seconds

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down background indexing service...');
    clearInterval(monitoringInterval);
    await stopUnifiedIndexerService(startedService);
    process.exit(0);
  });

  // Keep service running
  return new Promise(() => {}); // Never resolves
}
```

---

## Performance Optimization

### Batch Processing Optimization

```typescript
async function optimizedBatchProcessing(client: UnifiedIndexingClient) {
  const fileIndexer = createUnifiedFileIndexer(client);

  // Optimized configuration for large directories
  const optimizedOptions = {
    batchSize: 200, // Larger batches for efficiency
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.log',
      '.env*',
      '**/*.test.js',
      '**/*.spec.js',
    ],
    includePatterns: ['*.ts', '*.js', '*.tsx', '*.jsx', '*.md', '*.json', '*.yaml', '*.yml'],
  };

  console.log('⚡ Starting optimized batch processing...');
  const startTime = Date.now();

  const stats = await fileIndexer.indexDirectory('./src', optimizedOptions);

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const filesPerSecond = stats.indexedFiles / (totalTime / 1000);

  console.log('⚡ Optimized processing completed:', {
    totalFiles: stats.totalFiles,
    indexedFiles: stats.indexedFiles,
    skippedFiles: stats.skippedFiles,
    errors: stats.errors.length,
    duration: `${totalTime}ms`,
    throughput: `${filesPerSecond.toFixed(1)} files/sec`,
    avgTimePerFile: `${(totalTime / stats.indexedFiles).toFixed(1)}ms/file`,
  });

  return stats;
}
```

### Search Performance Tuning

```typescript
async function searchPerformanceTuning(searchEngine: CrossDomainSearchEngineState) {
  const testQueries = [
    'unified indexer',
    'contextStore implementation',
    'TypeScript patterns',
    'search optimization',
    'vector database',
  ];

  const configurations = [
    {
      name: 'Basic Search',
      options: { limit: 10, semantic: false },
    },
    {
      name: 'Semantic Search',
      options: { limit: 10, semantic: true },
    },
    {
      name: 'Hybrid Search',
      options: { limit: 10, semantic: true, hybridSearch: true },
    },
    {
      name: 'Optimized Search',
      options: {
        limit: 10,
        semantic: true,
        hybridSearch: true,
        timeBoost: true,
        deduplicate: true,
      },
    },
  ];

  const performanceResults = [];

  for (const config of configurations) {
    console.log(`\n🔧 Testing: ${config.name}`);

    const configResults = [];

    for (const query of testQueries) {
      const startTime = Date.now();

      try {
        const results = await search(searchEngine, {
          query,
          ...config.options,
        });

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        configResults.push({
          query,
          totalTime,
          apiTime: results.took,
          resultCount: results.results.length,
          overhead: totalTime - results.took,
        });

        console.log(`   "${query}": ${results.results.length} results in ${totalTime}ms`);
      } catch (error) {
        console.error(`   ❌ Failed: ${error}`);
      }
    }

    // Calculate averages for this configuration
    const avgTotalTime =
      configResults.reduce((sum, r) => sum + r.totalTime, 0) / configResults.length;
    const avgApiTime = configResults.reduce((sum, r) => sum + r.apiTime, 0) / configResults.length;
    const avgResultCount =
      configResults.reduce((sum, r) => sum + r.resultCount, 0) / configResults.length;

    performanceResults.push({
      config: config.name,
      avgTotalTime,
      avgApiTime,
      avgResultCount,
      results: configResults,
    });

    console.log(
      `   📊 Averages: ${avgTotalTime.toFixed(1)}ms total, ${avgApiTime.toFixed(1)}ms API, ${avgResultCount.toFixed(1)} results`,
    );
  }

  // Find best configuration
  const bestConfig = performanceResults.reduce((best, current) =>
    current.avgTotalTime < best.avgTotalTime ? current : best,
  );

  console.log(`\n🏆 Best configuration: ${bestConfig.config}`);
  console.log(`   Average time: ${bestConfig.avgTotalTime.toFixed(1)}ms`);
  console.log(`   Average results: ${bestConfig.avgResultCount.toFixed(1)}`);

  return performanceResults;
}
```

### Memory Optimization

```typescript
async function memoryOptimizedSearch(searchEngine: CrossDomainSearchEngineState) {
  console.log('🧠 Testing memory-optimized search patterns...');

  // Test different context limits to find optimal memory usage
  const contextLimits = [5, 10, 15, 20, 25];
  const memoryUsage = [];

  for (const limit of contextLimits) {
    try {
      console.log(`\n📏 Testing context limit: ${limit}`);

      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      const { searchResults, context } = await getContextualSearch(
        searchEngine,
        ['unified indexer', 'contextStore', 'search implementation'],
        {
          limit: 50,
          semantic: true,
          formatForLLM: true,
          contextLimit: limit,
          timeBoost: true,
        },
      );

      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      const memoryDiff = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      };

      const metrics = {
        contextLimit: limit,
        searchTime: endTime - startTime,
        searchResults: searchResults.results.length,
        contextMessages: context.length,
        memoryUsage: memoryDiff,
        avgMessageSize:
          context.reduce((sum, msg) => sum + (msg?.content?.length || 0), 0) / context.length,
      };

      memoryUsage.push(metrics);

      console.log(`   Search time: ${metrics.searchTime}ms`);
      console.log(`   Results: ${metrics.searchResults}, Context: ${metrics.contextMessages}`);
      console.log(`   Memory increase: ${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Avg message size: ${metrics.avgMessageSize.toFixed(0)} chars`);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      console.error(`❌ Failed for limit ${limit}:`, error);
    }
  }

  // Analyze memory efficiency
  console.log('\n📊 Memory Efficiency Analysis:');
  memoryUsage.forEach((metrics) => {
    const memoryPerMessage = metrics.memoryUsage.heapUsed / metrics.contextMessages;
    console.log(
      `   Limit ${metrics.contextLimit}: ${(memoryPerMessage / 1024).toFixed(1)}KB per message`,
    );
  });

  // Find optimal limit (best balance of context and memory)
  const optimalLimit = memoryUsage.reduce((best, current) => {
    const currentScore = current.contextMessages / (current.memoryUsage.heapUsed / 1024 / 1024);
    const bestScore = best.contextMessages / (best.memoryUsage.heapUsed / 1024 / 1024);
    return currentScore > bestScore ? current : best;
  });

  console.log(`\n🎯 Optimal context limit: ${optimalLimit.contextLimit}`);
  console.log(`   Messages: ${optimalLimit.contextMessages}`);
  console.log(
    `   Memory efficiency: ${(optimalLimit.contextMessages / (optimalLimit.memoryUsage.heapUsed / 1024 / 1024)).toFixed(1)} messages/MB`,
  );

  return memoryUsage;
}
```

---

## Error Handling

### Comprehensive Error Handling

```typescript
async function robustSearchWithErrorHandling(searchEngine: CrossDomainSearchEngineState) {
  const testCases = [
    {
      name: 'Valid Search',
      query: 'unified indexer',
      options: { limit: 10 },
    },
    {
      name: 'Empty Query',
      query: '',
      options: { limit: 10 },
    },
    {
      name: 'Very Long Query',
      query: 'a'.repeat(1000),
      options: { limit: 10 },
    },
    {
      name: 'Invalid Limit',
      query: 'test',
      options: { limit: -1 },
    },
    {
      name: 'Special Characters',
      query: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      options: { limit: 10 },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);

    try {
      const startTime = Date.now();

      const results = await search(searchEngine, {
        query: testCase.query,
        ...testCase.options,
        semantic: true,
        includeAnalytics: true,
      });

      const endTime = Date.now();

      console.log(`✅ Success: ${results.results.length} results in ${endTime - startTime}ms`);

      // Validate response structure
      if (typeof results.total !== 'number') {
        console.warn('⚠️ Invalid total count');
      }

      if (!Array.isArray(results.results)) {
        console.warn('⚠️ Invalid results array');
      }

      if (results.analytics && typeof results.analytics.averageScore !== 'number') {
        console.warn('⚠️ Invalid analytics');
      }
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Categorize error types
      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          console.log('   Type: Validation Error');
        } else if (error.message.includes('connection')) {
          console.log('   Type: Connection Error');
        } else if (error.message.includes('timeout')) {
          console.log('   Type: Timeout Error');
        } else if (error.message.includes('permission')) {
          console.log('   Type: Permission Error');
        } else {
          console.log('   Type: Unknown Error');
        }
      }
    }
  }
}
```

### Retry Logic with Exponential Backoff

```typescript
async function searchWithRetry(
  searchEngine: CrossDomainSearchEngineState,
  query: string,
  options = {},
  maxRetries = 3,
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Search attempt ${attempt}/${maxRetries}: "${query}"`);

      const results = await search(searchEngine, {
        query,
        ...options,
      });

      if (attempt > 1) {
        console.log(`✅ Success on attempt ${attempt}`);
      }

      return results;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

      // Don't retry on certain errors
      if (
        lastError.message.includes('validation') ||
        lastError.message.includes('permission') ||
        lastError.message.includes('authentication')
      ) {
        console.log('🚫 Non-retryable error, giving up');
        throw lastError;
      }

      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`💥 All ${maxRetries} attempts failed`);
  throw lastError;
}

// Usage example
async function robustSearchExample(searchEngine: CrossDomainSearchEngineState) {
  const queries = [
    'unified indexer implementation',
    'contextStore patterns',
    'search optimization',
  ];

  for (const query of queries) {
    try {
      const results = await searchWithRetry(searchEngine, query, { limit: 10, semantic: true }, 3);

      console.log(`✅ "${query}": ${results.results.length} results`);
    } catch (error) {
      console.error(`💥 Final failure for "${query}":`, error);
    }
  }
}
```

---

## Real-World Scenarios

### Code Documentation Assistant

```typescript
async function codeDocumentationAssistant(searchEngine: CrossDomainSearchEngineState) {
  console.log('📚 Code Documentation Assistant');

  const documentationQueries = [
    'How to implement unified indexer service',
    'Best practices for contextStore integration',
    'Error handling patterns in TypeScript',
    'Performance optimization techniques',
  ];

  for (const query of documentationQueries) {
    try {
      console.log(`\n📖 Query: "${query}"`);

      // Get comprehensive context
      const { searchResults, context } = await getContextualSearch(
        searchEngine,
        [query, 'documentation', 'examples', 'implementation'],
        {
          limit: 25,
          semantic: true,
          formatForLLM: true,
          contextLimit: 12,
          sourceWeights: {
            filesystem: 1.4, // Boost code files
          },
          typeWeights: {
            file: 1.3, // Boost files
            document: 1.2, // Boost documentation
          },
          timeBoost: false, // Don't prioritize recency for documentation
        },
      );

      console.log(
        `📊 Found ${searchResults.results.length} sources, generated ${context.length} context messages`,
      );

      // Categorize results by type
      const resultsByType = searchResults.results.reduce(
        (acc, result) => {
          const type = result.content.type;
          if (!acc[type]) acc[type] = [];
          acc[type].push(result);
          return acc;
        },
        {} as Record<string, typeof searchResults.results>,
      );

      console.log('📋 Content breakdown:');
      Object.entries(resultsByType).forEach(([type, results]) => {
        console.log(`   ${type}: ${results.length} items`);
      });

      // Show top 3 most relevant results
      console.log('\n🔝 Most relevant content:');
      searchResults.results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. [${result.content.type}] ${result.content.id}`);
        console.log(`   Score: ${result.score.toFixed(3)}`);
        console.log(`   ${result.content.content.substring(0, 120)}...`);
      });
    } catch (error) {
      console.error(`❌ Documentation query failed:`, error);
    }
  }
}
```

### Debug Assistant

```typescript
async function debugAssistant(searchEngine: CrossDomainSearchEngineState) {
  console.log('🐛 Debug Assistant');

  const debugScenarios = [
    {
      name: 'Connection Issues',
      symptoms: ['connection failed', 'timeout', 'cannot connect'],
      queries: ['database connection', 'timeout handling', 'error recovery'],
    },
    {
      name: 'Performance Problems',
      symptoms: ['slow search', 'high memory', 'poor performance'],
      queries: ['performance optimization', 'memory management', 'search efficiency'],
    },
    {
      name: 'Indexing Errors',
      symptoms: ['indexing failed', 'missing content', 'sync issues'],
      queries: ['indexing errors', 'synchronization', 'content management'],
    },
  ];

  for (const scenario of debugScenarios) {
    console.log(`\n🔍 Debugging: ${scenario.name}`);

    try {
      // Search for relevant debugging information
      const results = await search(searchEngine, {
        query: scenario.queries.join(' '),
        limit: 15,
        semantic: true,
        timeBoost: true, // Prioritize recent solutions
        recencyDecay: 168, // 1 week
        includeAnalytics: true,
        explainScores: true,
      });

      console.log(`📊 Found ${results.results.length} debugging resources`);

      // Group by relevance score
      const highRelevance = results.results.filter((r) => r.score > 0.8);
      const mediumRelevance = results.results.filter((r) => r.score > 0.5 && r.score <= 0.8);
      const lowRelevance = results.results.filter((r) => r.score <= 0.5);

      console.log('📈 Relevance distribution:');
      console.log(`   High (>0.8): ${highRelevance.length}`);
      console.log(`   Medium (0.5-0.8): ${mediumRelevance.length}`);
      console.log(`   Low (≤0.5): ${lowRelevance.length}`);

      // Show most relevant solutions
      if (highRelevance.length > 0) {
        console.log('\n💡 Most relevant solutions:');
        highRelevance.slice(0, 3).forEach((result, index) => {
          console.log(`${index + 1}. ${result.content.id} (${result.score.toFixed(3)})`);
          console.log(`   ${result.content.content.substring(0, 150)}...`);
        });
      }

      // Get context for detailed analysis
      const { context } = await getContextualSearch(searchEngine, scenario.queries, {
        limit: 20,
        semantic: true,
        formatForLLM: true,
        contextLimit: 8,
        timeBoost: true,
      });

      console.log(`\n🤖 Generated ${context.length} context messages for analysis`);
    } catch (error) {
      console.error(`❌ Debug scenario failed:`, error);
    }
  }
}
```

### Learning Path Generator

```typescript
async function learningPathGenerator(searchEngine: CrossDomainSearchEngineState) {
  console.log('🎓 Learning Path Generator');

  const learningTopics = [
    {
      name: 'Getting Started',
      level: 'beginner',
      queries: ['introduction', 'getting started', 'basic concepts', 'setup'],
      prerequisites: [],
    },
    {
      name: 'Core Implementation',
      level: 'intermediate',
      queries: ['implementation', 'core features', 'service setup', 'configuration'],
      prerequisites: ['Getting Started'],
    },
    {
      name: 'Advanced Features',
      level: 'advanced',
      queries: ['advanced features', 'optimization', 'scaling', 'performance'],
      prerequisites: ['Core Implementation'],
    },
    {
      name: 'Integration Patterns',
      level: 'expert',
      queries: ['integration', 'production deployment', 'monitoring', 'troubleshooting'],
      prerequisites: ['Advanced Features'],
    },
  ];

  const learningPath = [];

  for (const topic of learningTopics) {
    console.log(`\n📚 Processing: ${topic.name} (${topic.level})`);

    try {
      // Search for learning materials
      const results = await search(searchEngine, {
        query: topic.queries.join(' '),
        limit: 20,
        semantic: true,
        typeWeights: {
          document: 1.3, // Boost documentation
          file: 1.2, // Boost code examples
        },
        includeAnalytics: true,
      });

      // Get context for comprehensive understanding
      const { context } = await getContextualSearch(searchEngine, topic.queries, {
        limit: 25,
        semantic: true,
        formatForLLM: true,
        contextLimit: 10,
      });

      // Analyze content difficulty and completeness
      const avgScore = results.analytics?.averageScore || 0;
      const contentTypes = results.analytics?.typesFound || [];
      const sourceCount = results.analytics?.sourcesSearched.length || 0;

      const topicData = {
        name: topic.name,
        level: topic.level,
        prerequisites: topic.prerequisites,
        content: {
          searchResults: results.results.length,
          contextMessages: context.length,
          averageScore: avgScore,
          contentTypes,
          sourceCount,
        },
        estimatedTime: Math.max(30, context.length * 5), // 5 minutes per context message
        difficulty: avgScore > 0.7 ? 'easy' : avgScore > 0.4 ? 'medium' : 'hard',
      };

      learningPath.push(topicData);

      console.log(`📊 Topic analysis:`);
      console.log(`   Results: ${topicData.content.searchResults}`);
      console.log(`   Context: ${topicData.content.contextMessages} messages`);
      console.log(`   Difficulty: ${topicData.difficulty}`);
      console.log(`   Estimated time: ${topicData.estimatedTime} minutes`);
      console.log(`   Content types: ${topicData.content.contentTypes.join(', ')}`);
    } catch (error) {
      console.error(`❌ Failed to process topic ${topic.name}:`, error);
    }
  }

  // Generate complete learning path
  console.log('\n🎯 Generated Learning Path:');
  learningPath.forEach((topic, index) => {
    const totalTime = learningPath.slice(0, index + 1).reduce((sum, t) => sum + t.estimatedTime, 0);
    console.log(`\n${index + 1}. ${topic.name} (${topic.level})`);
    console.log(`   ⏱️  ${topic.estimatedTime} minutes (cumulative: ${totalTime} minutes)`);
    console.log(
      `   📚 ${topic.content.searchResults} resources, ${topic.content.contextMessages} context messages`,
    );
    console.log(`   🎯 Difficulty: ${topic.difficulty}`);
    if (topic.prerequisites.length > 0) {
      console.log(`   📋 Prerequisites: ${topic.prerequisites.join(', ')}`);
    }
  });

  const totalEstimatedTime = learningPath.reduce((sum, topic) => sum + topic.estimatedTime, 0);
  console.log(`\n⏰ Total estimated learning time: ${Math.round(totalEstimatedTime / 60)} hours`);

  return learningPath;
}
```

---

These examples provide comprehensive, real-world usage patterns for the unified-indexer package. Each example includes proper error handling, performance considerations, and practical implementation details that you can adapt for your specific use cases.
