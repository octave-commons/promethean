/**
 * Service Types Tests
 *
 * Tests for UnifiedIndexerServiceConfig, ServiceStatus, and UnifiedIndexerStats
 */

import test from 'ava';

import {
  validateUnifiedIndexerServiceConfig,
  validateServiceStatus,
  validateUnifiedIndexerStats,
  isUnifiedIndexerServiceConfig,
  isServiceStatus,
  isUnifiedIndexerStats,
} from '../utils/type-validators.js';
import {
  createMinimalConfig,
  createMockServiceStatus,
  createMockContentList,
} from '../utils/mock-factories.js';
import type {
  UnifiedIndexerServiceConfig,
  ServiceStatus,
  UnifiedIndexerStats,
} from '../../types/service.js';

test('should validate minimal service configuration', (t) => {
  const config = createMinimalConfig();
  const result = validateUnifiedIndexerServiceConfig(config);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should reject invalid service configuration', (t) => {
  const invalidConfig = {
    // Missing required properties
    indexing: {},
    contextStore: {},
    sources: {},
    sync: {},
  };

  const result = validateUnifiedIndexerServiceConfig(invalidConfig);

  t.false(result.valid);
  t.true(result.errors.length > 0);
  t.true(result.errors.some((error) => error.includes('Missing required property')));
});

test('should validate service status', (t) => {
  const status = createMockServiceStatus();
  const result = validateServiceStatus(status);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should reject invalid service status', (t) => {
  const invalidStatus = {
    healthy: 'not-a-boolean',
    indexing: 'not-a-boolean',
    lastSync: 'not-a-number',
    nextSync: -1,
    activeSources: 'not-an-array',
    issues: 'not-an-array',
  };

  const result = validateServiceStatus(invalidStatus);

  t.false(result.valid);
  t.true(result.errors.length > 0);
});

test('should validate unified indexer stats', (t) => {
  const stats: UnifiedIndexerStats = {
    total: {
      totalContent: 100,
      totalFiles: 80,
      totalMessages: 20,
      indexedFiles: 75,
      skippedFiles: 5,
      errors: [],
    },
    bySource: {
      filesystem: {
        totalFiles: 80,
        indexedFiles: 75,
        skippedFiles: 5,
        errors: [],
      },
    },
    byType: {
      file: 80,
      document: 15,
      message: 5,
      task: 0,
      event: 0,
      session: 0,
      attachment: 0,
      thought: 0,
      board: 0,
    },
    lastSync: Date.now(),
    syncDuration: 5000,
    errors: [],
  };

  const result = validateUnifiedIndexerStats(stats);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should reject invalid unified indexer stats', (t) => {
  const invalidStats = {
    total: 'not-an-object',
    bySource: 'not-an-object',
    byType: 'not-an-object',
    lastSync: 'not-a-number',
    syncDuration: -1,
    errors: 'not-an-array',
  };

  const result = validateUnifiedIndexerStats(invalidStats);

  t.false(result.valid);
  t.true(result.errors.length > 0);
});

test('should validate configuration with all sources enabled', (t) => {
  const config: UnifiedIndexerServiceConfig = {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'test-index',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: 'mongodb://localhost:27017',
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
      formatTime: (ms: number) => new Date(ms).toISOString(),
      assistantName: 'TestAssistant',
    },
    sources: {
      files: {
        enabled: true,
        paths: ['/test/path'],
        options: {
          includePatterns: ['*.ts', '*.js'],
          excludePatterns: ['node_modules'],
          maxFileSize: 1000000,
        },
      },
      discord: {
        enabled: true,
        provider: 'test-provider',
        tenant: 'test-tenant',
      },
      opencode: {
        enabled: true,
        sessionId: 'test-session',
      },
      kanban: {
        enabled: true,
        boardId: 'test-board',
      },
    },
    sync: {
      interval: 60000,
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  };

  const result = validateUnifiedIndexerServiceConfig(config);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
});

test('should validate configuration with disabled sources', (t) => {
  const config: UnifiedIndexerServiceConfig = {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'test-index',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: 'mongodb://localhost:27017',
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
      interval: 60000,
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  };

  const result = validateUnifiedIndexerServiceConfig(config);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
});

test('should reject configuration with invalid sync values', (t) => {
  const config = createMinimalConfig();
  config.sync.interval = -1; // Invalid: negative
  config.sync.batchSize = 0; // Invalid: zero
  config.sync.retryAttempts = -1; // Invalid: negative
  config.sync.retryDelay = -1; // Invalid: negative

  const result = validateUnifiedIndexerServiceConfig(config);

  t.false(result.valid);
  t.true(result.errors.some((error) => error.includes('sync.interval')));
  t.true(result.errors.some((error) => error.includes('sync.batchSize')));
  t.true(result.errors.some((error) => error.includes('sync.retryAttempts')));
  t.true(result.errors.some((error) => error.includes('sync.retryDelay')));
});

test('should type guard functions work correctly', (t) => {
  const validConfig = createMinimalConfig();
  const invalidConfig = { invalid: 'config' };

  t.true(isUnifiedIndexerServiceConfig(validConfig));
  t.false(isUnifiedIndexerServiceConfig(invalidConfig));

  const validStatus = createMockServiceStatus();
  const invalidStatus = { invalid: 'status' };

  t.true(isServiceStatus(validStatus));
  t.false(isServiceStatus(invalidStatus));

  const validStats: UnifiedIndexerStats = {
    total: {
      totalContent: 100,
      totalFiles: 80,
      totalMessages: 20,
      indexedFiles: 75,
      skippedFiles: 5,
      errors: [],
    },
    bySource: {},
    byType: {
      file: 80,
      document: 15,
      message: 5,
      task: 0,
      event: 0,
      session: 0,
      attachment: 0,
      thought: 0,
      board: 0,
    },
    lastSync: Date.now(),
    syncDuration: 5000,
    errors: [],
  };
  const invalidStats = { invalid: 'stats' };

  t.true(isUnifiedIndexerStats(validStats));
  t.false(isUnifiedIndexerStats(invalidStats));
});

test('should handle edge cases in configuration validation', (t) => {
  // Test with null/undefined values
  const nullConfig = null;
  const undefinedConfig = undefined;
  const emptyConfig = {};

  const nullResult = validateUnifiedIndexerServiceConfig(nullConfig);
  const undefinedResult = validateUnifiedIndexerServiceConfig(undefinedConfig);
  const emptyResult = validateUnifiedIndexerServiceConfig(emptyConfig);

  t.false(nullResult.valid);
  t.false(undefinedResult.valid);
  t.false(emptyResult.valid);

  t.true(nullResult.errors.length > 0);
  t.true(undefinedResult.errors.length > 0);
  t.true(emptyResult.errors.length > 0);
});

test('should validate configuration with missing collections', (t) => {
  const config = createMinimalConfig();
  // Remove one required collection
  delete (config.contextStore.collections as any).files;

  const result = validateUnifiedIndexerServiceConfig(config);

  t.false(result.valid);
  t.true(result.errors.some((error) => error.includes('Missing required collection')));
});

test('should validate configuration with invalid source enabled property', (t) => {
  const config = createMinimalConfig();
  config.sources.files.enabled = 'not-a-boolean' as any;

  const result = validateUnifiedIndexerServiceConfig(config);

  t.false(result.valid);
  t.true(result.errors.some((error) => error.includes("must have boolean 'enabled' property")));
});
