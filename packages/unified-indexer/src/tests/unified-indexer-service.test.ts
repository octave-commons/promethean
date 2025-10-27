/**
 * Unit Tests for UnifiedIndexerService
 *
 * Tests for service lifecycle, configuration, and core functionality
 */

import test from 'ava';
import sinon from 'sinon';

import { UnifiedIndexerService } from '../unified-indexer-service.js';
import { createMinimalConfig, createMockServiceStatus } from './utils/mock-factories.js';
import { sleep, assertRejects, createMockContent } from './utils/test-helpers.js';

test.beforeEach(() => {
  sinon.restore();
});

test('should create service with minimal configuration', (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  t.truthy(service);
  t.false(service.isRunning);
});

test('should initialize service successfully', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  t.true(service.isRunning);
});

test('should fail initialization with invalid config', async (t) => {
  const invalidConfig = {
    indexing: {
      vectorStore: {
        type: 'invalid',
        connectionString: '',
        indexName: '',
      },
    },
  } as any;

  const service = new UnifiedIndexerService(invalidConfig);

  await assertRejects(t, service.initialize(), 'Invalid configuration');
});

test('should start service and begin periodic sync', async (t) => {
  const config = createMinimalConfig();
  config.sync.interval = 100; // Short interval for testing
  const service = new UnifiedIndexerService(config);

  await service.initialize();
  await service.start();

  t.true(service.isRunning);

  // Wait for at least one sync cycle
  await sleep(150);

  const status = service.getStatus();
  t.true(status.healthy);

  await service.stop();
});

test('should stop service and cleanup resources', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();
  await service.start();

  t.true(service.isRunning);

  await service.stop();

  t.false(service.isRunning);
});

test('should handle start when already running', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();
  await service.start();

  // Should not throw when starting already running service
  await service.start();

  t.true(service.isRunning);

  await service.stop();
});

test('should handle stop when not running', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Should not throw when stopping non-running service
  await service.stop();

  t.false(service.isRunning);
});

test('should return correct service status', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const status = service.getStatus();

  t.true(status.healthy);
  t.false(status.indexing);
  t.true(Array.isArray(status.activeSources));
  t.true(Array.isArray(status.issues));

  await service.stop();
});

test('should perform full sync successfully', async (t) => {
  const config = createMinimalConfig();
  config.sources.files.enabled = true;
  config.sources.files.paths = ['/test'];

  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock the file indexer to avoid actual file system operations
  const mockIndexer = {
    indexDirectory: sinon.stub().resolves({
      totalFiles: 5,
      indexedFiles: 5,
      skippedFiles: 0,
      errors: [],
      duration: 100,
    }),
    cleanup: sinon.stub().resolves(),
  };

  (service as any).fileIndexer = mockIndexer;

  await service.performFullSync();

  t.true(mockIndexer.indexDirectory.called);

  await service.stop();
});

test('should handle sync errors gracefully', async (t) => {
  const config = createMinimalConfig();
  config.sources.files.enabled = true;
  config.sources.files.paths = ['/test'];

  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock indexer to throw error
  const mockIndexer = {
    indexDirectory: sinon.stub().rejects(new Error('Indexing failed')),
    cleanup: sinon.stub().resolves(),
  };

  (service as any).fileIndexer = mockIndexer;

  await service.performFullSync();

  const status = service.getStatus();
  t.true(status.issues.length > 0);

  await service.stop();
});

test('should return comprehensive stats', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const stats = service.getStats();

  t.truthy(stats.total);
  t.truthy(stats.bySource);
  t.truthy(stats.byType);
  t.true(typeof stats.lastSync === 'number');
  t.true(typeof stats.syncDuration === 'number');
  t.true(Array.isArray(stats.errors));

  await service.stop();
});

test('should search through unified client', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock the unified client search
  const mockSearchResponse = {
    results: [createMockContent()],
    total: 1,
    took: 25,
    query: { query: 'test', limit: 10 },
  };

  const mockUnifiedClient = {
    search: sinon.stub().resolves(mockSearchResponse),
    getStats: sinon.stub().resolves({
      totalContent: 1,
      contentByType: { file: 1 },
      contentBySource: { filesystem: 1 },
      lastIndexed: Date.now(),
      storageStats: { vectorSize: 1000, metadataSize: 500, totalSize: 1500 },
    }),
    healthCheck: sinon.stub().resolves({ healthy: true, issues: [] }),
    close: sinon.stub().resolves(),
  };

  (service as any).unifiedClient = mockUnifiedClient;

  const searchQuery = { query: 'test', limit: 10 };
  const results = await service.search(searchQuery);

  t.true(mockUnifiedClient.search.calledWith(searchQuery));
  t.deepEqual(results, mockSearchResponse);

  await service.stop();
});

test('should handle search errors', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock unified client to throw error
  const mockUnifiedClient = {
    search: sinon.stub().rejects(new Error('Search failed')),
    getStats: sinon.stub().resolves({
      totalContent: 0,
      contentByType: {},
      contentBySource: {},
      lastIndexed: Date.now(),
      storageStats: { vectorSize: 0, metadataSize: 0, totalSize: 0 },
    }),
    healthCheck: sinon.stub().resolves({ healthy: true, issues: [] }),
    close: sinon.stub().resolves(),
  };

  (service as any).unifiedClient = mockUnifiedClient;

  const searchQuery = { query: 'test', limit: 10 };

  await assertRejects(t, service.search(searchQuery), 'Search failed');

  await service.stop();
});

test('should get context from context store', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock context store
  const mockContextStore = {
    collections: new Map([
      ['files', { get: sinon.stub().resolves('file content') }],
      ['unified', { get: sinon.stub().resolves('unified content') }],
    ]),
    formatTime: sinon.stub().returns('formatted-time'),
    assistantName: 'TestAssistant',
  };

  (service as any).contextStore = mockContextStore;

  const context = await service.getContext('test query');

  t.truthy(context);
  t.true(typeof context === 'string');

  await service.stop();
});

test('should handle context retrieval errors', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock context store to throw error
  const mockContextStore = {
    collections: new Map([
      ['unified', { get: sinon.stub().rejects(new Error('Context retrieval failed')) }],
    ]),
    formatTime: sinon.stub().returns('formatted-time'),
    assistantName: 'TestAssistant',
  };

  (service as any).contextStore = mockContextStore;

  await assertRejects(t, service.getContext('test query'), 'Context retrieval failed');

  await service.stop();
});

test('should initialize context collections', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock getOrCreateCollection to track calls
  const mockGetOrCreateCollection = sinon.stub().resolves();
  (service as any).getOrCreateCollection = mockGetOrCreateCollection;

  await service.initializeContextCollections();

  // Should be called for each collection type
  t.true(mockGetOrCreateCollection.calledMultipleTimes);

  await service.stop();
});

test('should initialize indexers based on config', async (t) => {
  const config = createMinimalConfig();
  config.sources.files.enabled = true;
  config.sources.discord.enabled = true;
  config.sources.opencode.enabled = true;
  config.sources.kanban.enabled = true;

  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Check that indexers are created when sources are enabled
  t.truthy((service as any).fileIndexer);
  t.truthy((service as any).discordIndexer);
  t.truthy((service as any).opencodeIndexer);
  t.truthy((service as any).kanbanIndexer);

  await service.stop();
});

test('should not initialize indexers when sources are disabled', async (t) => {
  const config = createMinimalConfig();
  // All sources are disabled by default

  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Indexers should be null/undefined when sources are disabled
  t.is((service as any).fileIndexer, undefined);
  t.is((service as any).discordIndexer, undefined);
  t.is((service as any).opencodeIndexer, undefined);
  t.is((service as any).kanbanIndexer, undefined);

  await service.stop();
});

test('should update unified collection after sync', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock context store collections
  const mockCollection = {
    get: sinon.stub().resolves([]),
    set: sinon.stub().resolves(),
  };

  const mockContextStore = {
    collections: new Map([
      ['files', mockCollection],
      ['unified', mockCollection],
    ]),
    formatTime: sinon.stub().returns('formatted-time'),
    assistantName: 'TestAssistant',
  };

  (service as any).contextStore = mockContextStore;

  await service.updateUnifiedCollection('files');

  t.true(mockCollection.get.called);
  t.true(mockCollection.set.called);

  await service.stop();
});
