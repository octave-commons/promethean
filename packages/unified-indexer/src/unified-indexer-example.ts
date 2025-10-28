/**
 * Unified Indexer Service Example
 *
 * This example demonstrates how to use the unified indexer service
 * to populate contextStore with data from multiple sources and enable
 * cross-domain search for LLM context.
 */

import {
  createUnifiedIndexerService,
  startUnifiedIndexerService,
  stopUnifiedIndexerService,
  getServiceStatus,
} from './unified-indexer-service.js';
import type { UnifiedIndexerServiceConfig } from './types/service.js';
import type { UnifiedIndexerServiceState } from './unified-indexer-service.js';

import type { SearchQuery } from '@promethean-os/persistence';

/**
 * Example configuration for unified indexer service
 */
const exampleConfig: UnifiedIndexerServiceConfig = {
  // Unified indexing client configuration
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: process.env.CHROMA_DB_URL || 'http://localhost:8000',
      indexName: 'promethean-unified',
    },
    metadataStore: {
      type: 'mongodb',
      connectionString: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      tableName: 'unified_content',
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 100,
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

  // Context store configuration
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

  // Data source configurations
  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs', './packages', './sites'],
      options: {
        batchSize: 50,
        excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '*.log', '.env*'],
        includePatterns: ['*.ts', '*.js', '*.md', '*.json', '*.yaml', '*.yml'],
        followSymlinks: false,
      },
    },
    discord: {
      enabled: false, // Enable when Discord integration is ready
    },
    opencode: {
      enabled: false, // Enable when OpenCode integration is ready
    },
    kanban: {
      enabled: false, // Enable when Kanban integration is ready
    },
  },

  // Sync configuration
  sync: {
    interval: 300000, // 5 minutes
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
  },
};

/**
 * Example usage of unified indexer service
 */
async function runUnifiedIndexerExample(): Promise<void> {
  console.log('🚀 Starting Unified Indexer Service Example...');

  try {
    const indexerService = await createUnifiedIndexerService(exampleConfig);
    await startUnifiedIndexerService(indexerService);
    console.log('✅ Unified Indexer Service started successfully');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const status = getServiceStatus(indexerService);
    console.log('📊 Service Status:', {
      healthy: status.healthy,
      indexing: status.indexing,
      activeSources: status.activeSources,
      lastSync: new Date(status.lastSync).toISOString(),
      issues: status.issues,
    });

    await demonstrateSearch(indexerService);
    await demonstrateContext(indexerService);
    await demonstratePerformance(indexerService);

    console.log('\n⏰ Keeping service running for 30 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 30000));

    await stopUnifiedIndexerService(indexerService);
    console.log('🛑 Unified Indexer Service stopped');
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

/**
 * Demonstrate search functionality
 */
async function demonstrateSearch(indexerService: UnifiedIndexerServiceState): Promise<void> {
  console.log('\n🔍 Example 1: Cross-domain search');
  const searchQuery: SearchQuery = {
    query: 'contextStore unified indexing',
    type: ['file', 'document'],
    limit: 10,
    fuzzy: true,
    semantic: true,
  };

  try {
    const searchResults = await indexerService.unifiedClient.search(searchQuery);
    console.log(`Found ${searchResults.results.length} results:`);
    searchResults.results.forEach((result, index: number) => {
      console.log(
        `  ${index + 1}. [${result.content.type}] ${result.content.id} (score: ${result.score.toFixed(3)})`,
      );
      console.log(`     Source: ${result.content.source}`);
      console.log(`     Preview: ${result.content.content.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('Search demonstration failed:', error);
  }
}

/**
 * Demonstrate context compilation
 */
async function demonstrateContext(indexerService: UnifiedIndexerServiceState): Promise<void> {
  console.log('\n🤖 Example 2: LLM context compilation');
  try {
    const context = await indexerService.contextStore.getContext(
      indexerService,
      ['unified indexer service', 'contextStore', 'cross-domain search'],
      {
        recentLimit: 5,
        queryLimit: 3,
        limit: 10,
        formatAssistantMessages: true,
      },
    );

    console.log(`✅ Compiled ${context.length} context messages for LLM consumption`);
    context.forEach((msg, index: number) => {
      if (msg && typeof msg === 'object' && 'content' in msg) {
        const message = msg as { role?: string; content: string };
        const role = message.role || 'unknown';
        console.log(`  ${index + 1}. [${role}] ${message.content.substring(0, 80)}...`);
      }
    });
  } catch (error) {
    console.error('Context demonstration failed:', error);
  }
}

/**
 * Demonstrate search performance
 */
async function demonstratePerformance(indexerService: UnifiedIndexerServiceState): Promise<void> {
  console.log('\n⚡ Example 3: Real-time search performance');
  const realtimeQueries = [
    'TypeScript implementation',
    'MongoDB integration',
    'ChromaDB vector search',
    'Unified content model',
  ];

  try {
    for (const query of realtimeQueries) {
      const startTime = Date.now();
      const results = await indexerService.unifiedClient.search({
        query,
        limit: 5,
        semantic: true,
      });
      const duration = Date.now() - startTime;

      console.log(`  Query "${query}": ${results.results.length} results in ${duration}ms`);
    }
  } catch (error) {
    console.error('Performance demonstration failed:', error);
  }
}

/**
 * Example of how to integrate with existing contextStore usage
 */
async function demonstrateContextStoreIntegration(): Promise<void> {
  console.log('\n🔗 Demonstrating ContextStore Integration...');

  // This shows how the unified indexer service integrates
  // with existing contextStore patterns in the codebase

  try {
    const indexerService = await createUnifiedIndexerService(exampleConfig);
    await startUnifiedIndexerService(indexerService);

    // Wait for initial sync
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get context just like existing contextStore usage
    const context = await indexerService.contextStore.getContext(
      indexerService,
      ['promethean architecture', 'agent coordination'],
      {
        recentLimit: 10,
        queryLimit: 5,
        limit: 15,
      },
    );

    console.log(`✅ Retrieved ${context.length} context messages from unified sources`);

    // The context can now be used exactly like existing contextStore.compileContext()
    // results - it's the same format expected by LLM clients

    await stopUnifiedIndexerService(indexerService);
  } catch (error) {
    console.error('ContextStore integration demonstration failed:', error);
  }
}

// Run examples if this file is executed directly
// Note: In production, this would be imported and called by other modules
// For demonstration purposes, we'll run the examples
if (process.argv[1] && process.argv[1].endsWith('unified-indexer-example.ts')) {
  runUnifiedIndexerExample()
    .then(() => demonstrateContextStoreIntegration())
    .then(() => {
      console.log('\n🎉 All examples completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Examples failed:', error);
      process.exit(1);
    });
}

export { runUnifiedIndexerExample, demonstrateContextStoreIntegration, exampleConfig };
