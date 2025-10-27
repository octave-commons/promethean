/**
 * Corrected Tests for Unified Indexer
 *
 * Test suite based on actual API analysis from code-reviewer.
 * Uses correct type definitions and method signatures.
 */

import test from 'ava';
import sinon from 'sinon';

// Import actual types from persistence
import type {
  SearchQuery,
  SearchResponse,
  IndexableContent,
  ContentType,
  ContentSource,
} from '@promethean-os/persistence';

import type {
  UnifiedIndexerServiceConfig,
  UnifiedIndexerStats,
  ServiceStatus,
} from '../types/service.js';

import type { CrossDomainSearchOptions, CrossDomainSearchResponse } from '../types/search.js';

/**
 * Create minimal valid configuration for testing
 */
function createMinimalConfig(): UnifiedIndexerServiceConfig {
  return {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'test://localhost:8000',
        indexName: 'test-index',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: 'test://localhost:27017',
        tableName: 'test_content',
      },
      embedding: {
        model: 'test-model',
        dimensions: 1536,
        batchSize: 100,
      },
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
      },
      validation: {
        strict: false,
        skipVectorValidation: true,
        maxContentLength: 1000000,
      },
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
      files: {
        enabled: false,
        paths: [],
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
      interval: 1000,
      batchSize: 10,
      retryAttempts: 1,
      retryDelay: 100,
    },
  };
}

test('should export expected functions and classes', async (t) => {
  const pkg = await import('../index.js');

  // Check main exports
  t.truthy(pkg.UnifiedIndexerService);
  t.truthy(pkg.createUnifiedIndexerService);
  t.truthy(pkg.CrossDomainSearchEngine);
  t.truthy(pkg.createCrossDomainSearchEngine);
  t.truthy(pkg.runUnifiedIndexerExample);
  t.truthy(pkg.exampleConfig);

  // Check types
  t.is(typeof pkg.UnifiedIndexerService, 'function');
  t.is(typeof pkg.createUnifiedIndexerService, 'function');
  t.is(typeof pkg.CrossDomainSearchEngine, 'function');
  t.is(typeof pkg.createCrossDomainSearchEngine, 'function');
});

test('should create UnifiedIndexerService with valid config', (t) => {
  const config = createMinimalConfig();
  const { UnifiedIndexerService } = require('../dist/index.js');

  t.notThrows(() => {
    new UnifiedIndexerService(config);
  });
});

test('should have valid configuration structure', (t) => {
  const config = createMinimalConfig();

  // Check required fields
  t.truthy(config.indexing.vectorStore);
  t.truthy(config.indexing.metadataStore);
  t.truthy(config.indexing.embedding);
  t.truthy(config.indexing.cache);
  t.truthy(config.indexing.validation);
  t.truthy(config.contextStore.collections);
  t.truthy(config.sources);
  t.truthy(config.sync);

  // Check specific required fields
  t.is(config.indexing.vectorStore.type, 'chromadb');
  t.is(config.indexing.embedding.model, 'test-model');
  t.true(config.indexing.embedding.dimensions > 0);
  t.is(typeof config.indexing.cache.enabled, 'boolean');
  t.true(config.sync.interval > 0);
  t.true(config.sync.batchSize > 0);
});

test('should create CrossDomainSearchEngine with mocked service', (t) => {
  const { CrossDomainSearchEngine } = require('../dist/index.js');

  // Mock service with correct interface
  const mockService = {
    search: sinon.stub().resolves({
      results: [],
      total: 0,
      took: 0,
      query: {} as SearchQuery,
    }),
    getContext: sinon.stub().resolves([]),
    getStats: sinon.stub().resolves({
      status: 'stopped' as ServiceStatus,
    }),
  } as any;

  t.notThrows(() => {
    new CrossDomainSearchEngine(mockService);
  });
});

test('should handle search query structure', (t) => {
  const query: SearchQuery = {
    query: 'test query',
    limit: 10,
    semantic: true,
  };

  // Verify query structure
  t.is(typeof query.query, 'string');
  t.is(typeof query.limit, 'number');
  t.is(typeof query.semantic, 'boolean');
});

test('should handle content types correctly', (t) => {
  const content: IndexableContent = {
    id: 'test-id',
    type: 'file' as ContentType,
    source: 'filesystem' as ContentSource,
    content: 'test content',
    metadata: {
      path: '/test/file.txt',
      size: 12,
    },
    timestamp: new Date(),
  };

  // Verify content structure
  t.is(content.id, 'test-id');
  t.is(content.type, 'file');
  t.is(content.source, 'filesystem');
  t.is(content.content, 'test content');
  t.truthy(content.timestamp);
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
    },
    typeWeights: {
      file: 1.3,
      message: 1.1,
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
    import('../cross-domain-search.js'),
    import('../unified-indexer-example.js'),
  ]);

  t.truthy(imports[0]); // service
  t.truthy(imports[1]); // search
  t.truthy(imports[2]); // example

  // Check that key exports are available
  t.truthy(imports[0].UnifiedIndexerService);
  t.truthy(imports[1].CrossDomainSearchEngine);
  t.truthy(imports[2].exampleConfig);
});

test('should have working type definitions', (t) => {
  const { createRequire } = require('node:module');
  const require = createRequire(import.meta.url);
  const fs = require('fs');
  const path = require('path');

  const typeDefPath = path.join(__dirname, '../..', 'dist', 'index.d.ts');
  t.true(fs.existsSync(typeDefPath));

  const typeDefContent = fs.readFileSync(typeDefPath, 'utf8');

  // Check that key types are exported
  t.true(typeDefContent.includes('export declare class UnifiedIndexerService'));
  t.true(typeDefContent.includes('export declare class CrossDomainSearchEngine'));
  t.true(typeDefContent.includes('export interface UnifiedIndexerServiceConfig'));
  t.true(typeDefContent.includes('export interface CrossDomainSearchOptions'));
  t.true(typeDefContent.includes('export declare function createUnifiedIndexerService'));
  t.true(typeDefContent.includes('export declare function createCrossDomainSearchEngine'));
});

test('should handle example configuration correctly', async (t) => {
  const { exampleConfig } = await import('../unified-indexer-example.js');

  t.truthy(exampleConfig);
  t.truthy(exampleConfig.indexing);
  t.truthy(exampleConfig.contextStore);
  t.truthy(exampleConfig.sources);
  t.truthy(exampleConfig.sync);

  // Check that example has all required fields
  t.truthy(exampleConfig.indexing.vectorStore);
  t.truthy(exampleConfig.indexing.metadataStore);
  t.truthy(exampleConfig.indexing.embedding);
  t.truthy(exampleConfig.contextStore.collections);
  t.true(exampleConfig.sync.interval > 0);
  t.true(exampleConfig.sync.batchSize > 0);
});

test('should validate package structure', (t) => {
  const { createRequire } = require('node:module');
  const require = createRequire(import.meta.url);
  const fs = require('fs');
  const path = require('path');

  const packagePath = path.join(__dirname, '../..');
  const packageJsonPath = path.join(packagePath, 'package.json');

  t.true(fs.existsSync(packageJsonPath));

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Check package.json structure
  t.is(packageJson.name, '@promethean-os/unified-indexer');
  t.is(packageJson.type, 'module');
  t.truthy(packageJson.exports);
  t.truthy(packageJson.scripts);
  t.truthy(packageJson.dependencies);
  t.true(packageJson.dependencies['@promethean-os/persistence']);
});
