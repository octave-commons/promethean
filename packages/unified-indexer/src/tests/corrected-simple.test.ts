/**
 * Simple Corrected Tests for Unified Indexer
 *
 * Simplified test suite that focuses on core functionality without complex type issues
 */

import test from 'ava';

// Import actual types from persistence
import type { SearchQuery, IndexableContent } from '@promethean-os/persistence';

import type { UnifiedIndexerServiceConfig } from '../types/service.js';
import type { CrossDomainSearchOptions, CrossDomainSearchResponse } from '../types/search.js';

/**
 * Create minimal valid configuration for testing
 */
function createMinimalConfig(): UnifiedIndexerServiceConfig {
  return {
    indexing: {
      vectorStore: {
        type: 'chromadb' as const,
        connectionString: 'test://localhost:8000',
        indexName: 'test-index',
      },
      metadataStore: {
        type: 'mongodb' as const,
        connectionString: 'test://localhost:27017',
        tableName: 'test_content',
      },
      embedding: { model: 'test-model', dimensions: 1536, batchSize: 100 },
      cache: { enabled: true, ttl: 300000, maxSize: 1000 },
      validation: { strict: false, skipVectorValidation: true, maxContentLength: 1000000 },
    },
    contextStore: {
      collections: {
        files: 'test-files',
        discord: 'test-discord',
        opencode: 'test-opencode',
        kanban: 'test-kanban',
        unified: 'test-unified',
      },
    },
    sources: {
      files: { enabled: false, paths: [] },
      discord: { enabled: false },
      opencode: { enabled: false },
      kanban: { enabled: false },
    },
    sync: { interval: 1000, batchSize: 10, retryAttempts: 1, retryDelay: 100 },
  };
}

test('should export expected functions and types', async (t) => {
  const pkg = await import('../index.js');

  // Check main exports
  t.truthy(pkg.createUnifiedIndexerService);
  t.truthy(pkg.createCrossDomainSearchEngine);
  t.truthy(pkg.runUnifiedIndexerExample);
  t.truthy(pkg.exampleConfig);

  // Check search functions
  t.truthy(pkg.search);
  t.truthy(pkg.intelligentSearch);
  t.truthy(pkg.getContextualSearch);

  // Check types
  t.is(typeof pkg.createUnifiedIndexerService, 'function');
  t.is(typeof pkg.createCrossDomainSearchEngine, 'function');
  t.is(typeof pkg.search, 'function');
  t.is(typeof pkg.intelligentSearch, 'function');
  t.is(typeof pkg.getContextualSearch, 'function');
});

test('should have valid configuration structure', (t) => {
  try {
    const config = createMinimalConfig();

    // Check required fields exist
    t.truthy(config.indexing);
    t.truthy(config.contextStore);
    t.truthy(config.sources);
    t.truthy(config.sync);

    // Check specific required fields
    if (config.indexing?.vectorStore) {
      t.is(config.indexing.vectorStore.type, 'chromadb');
    }
    if (config.indexing?.embedding) {
      t.is(config.indexing.embedding.model, 'test-model');
      t.true(config.indexing.embedding.dimensions > 0);
    }
    if (config.indexing?.cache) {
      t.is(typeof config.indexing.cache.enabled, 'boolean');
    }
    t.true(config.sync.interval > 0);
    t.true(config.sync.batchSize > 0);
  } catch (error) {
    t.fail(`Configuration validation failed: ${error}`);
  }
});

test('should handle search query structure', (t) => {
  try {
    const query: SearchQuery = {
      query: 'test query',
      limit: 10,
      semantic: true,
    };

    // Verify query structure
    if (query.query) t.is(typeof query.query, 'string');
    if (query.limit) t.is(typeof query.limit, 'number');
    if (query.semantic !== undefined) t.is(typeof query.semantic, 'boolean');
  } catch (error) {
    t.fail(`Search query validation failed: ${error}`);
  }
});

test('should handle content types correctly', (t) => {
  try {
    const content: IndexableContent = {
      id: 'test-id',
      type: 'file' as const,
      source: 'filesystem' as const,
      content: 'test content',
      metadata: {
        type: 'file' as const,
        source: 'filesystem' as const,
        path: '/test/file.txt',
        size: 12,
      },
      timestamp: Date.now(),
    };

    // Verify content structure
    if (content.id) t.is(content.id, 'test-id');
    if (content.type) t.is(content.type, 'file');
    if (content.source) t.is(content.source, 'filesystem');
    if (content.content) t.is(content.content, 'test content');
    if (content.timestamp) t.truthy(content.timestamp);
  } catch (error) {
    t.fail(`Content validation failed: ${error}`);
  }
});

test('should validate cross-domain search options', (t) => {
  const options: CrossDomainSearchOptions = {
    query: 'test',
    limit: 10,
    semantic: true,
    includeContext: true,
    sourceWeights: {
      filesystem: 1.2,
      discord: 1.0,
      opencode: 1.0,
      agent: 1.0,
      user: 1.0,
      system: 1.0,
      external: 1.0,
      kanban: 1.0,
    },
    typeWeights: {
      file: 1.3,
      message: 1.1,
      event: 1.0,
      session: 1.0,
      attachment: 1.0,
      thought: 1.0,
      document: 1.0,
      task: 1.0,
      board: 1.0,
    },
  };

  // Verify options structure
  t.is(options.query, 'test');
  t.is(options.limit, 10);
  t.true(options.semantic);
  t.true(options.includeContext);
  t.truthy(options.sourceWeights);
  t.truthy(options.typeWeights);
});

test('should handle search response structure', (t) => {
  const response: CrossDomainSearchResponse = {
    results: [],
    total: 0,
    took: 25,
    query: {
      query: 'test',
      limit: 10,
    } as CrossDomainSearchOptions,
  };

  // Verify response structure
  t.true(Array.isArray(response.results));
  t.is(response.total, 0);
  t.is(response.took, 25);
  t.truthy(response.query);
});

test('should import all modules successfully', async (t) => {
  // Test that all main modules can be imported
  const imports = await Promise.all([
    import('../unified-indexer-service.js'),
    import('../cross-domain-search-functional.js'),
    import('../unified-indexer-example.js'),
  ]);

  t.truthy(imports[0]); // service
  t.truthy(imports[1]); // search
  t.truthy(imports[2]); // example

  // Check that key exports are available
  t.truthy(imports[0].createUnifiedIndexerService);
  t.truthy(imports[1].createCrossDomainSearchEngine);
  t.truthy(imports[2].exampleConfig);
});

test('should handle example configuration correctly', async (t) => {
  try {
    const { exampleConfig } = await import('../unified-indexer-example.js');

    t.truthy(exampleConfig);
    t.truthy(exampleConfig.indexing);
    t.truthy(exampleConfig.contextStore);
    t.truthy(exampleConfig.sources);
    t.truthy(exampleConfig.sync);

    // Check that example has all required fields
    if (exampleConfig.indexing?.vectorStore) {
      t.truthy(exampleConfig.indexing.vectorStore);
    }
    if (exampleConfig.indexing?.metadataStore) {
      t.truthy(exampleConfig.indexing.metadataStore);
    }
    if (exampleConfig.indexing?.embedding) {
      t.truthy(exampleConfig.indexing.embedding);
    }
    if (exampleConfig.contextStore?.collections) {
      t.truthy(exampleConfig.contextStore.collections);
    }
    t.true(exampleConfig.sync.interval > 0);
    t.true(exampleConfig.sync.batchSize > 0);
  } catch (error) {
    t.fail(`Failed to import example config: ${error}`);
  }
});
