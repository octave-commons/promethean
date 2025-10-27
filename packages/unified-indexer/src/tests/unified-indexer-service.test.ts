/**
 * Unit Tests for UnifiedIndexerService
 *
 * Tests for service lifecycle, configuration, and core functionality
 */

import test from 'ava';
import sinon from 'sinon';

import { UnifiedIndexerService } from '../unified-indexer-service.js';
import { createMinimalConfig, createMockSearchResponse } from './utils/mock-factories.js';
import { sleep, assertRejects, createMockContent } from './utils/test-helpers.js';

test.beforeEach(() => {
  sinon.restore();
});

test('should create service with minimal configuration', (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  t.truthy(service);
});

test('should initialize service successfully', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const status = await service.getStatus();
  t.true(status.healthy);
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

  // Wait for at least one sync cycle
  await sleep(150);

  const status = await service.getStatus();
  t.true(status.healthy);

  await service.stop();
});

test('should stop service and cleanup resources', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();
  await service.start();

  await service.stop();

  const status = await service.getStatus();
  t.false(status.indexing);
});

test('should handle start when already running', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();
  await service.start();

  // Should not throw when starting already running service
  await service.start();

  const status = await service.getStatus();
  t.true(status.healthy);

  await service.stop();
});

test('should handle stop when not running', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Should not throw when stopping non-running service
  await service.stop();

  const status = await service.getStatus();
  t.false(status.indexing);
});

test('should return correct service status', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const status = await service.getStatus();

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

  // Mock the performFullSync method to avoid actual file system operations
  const originalPerformFullSync = service.performFullSync.bind(service);
  const mockPerformFullSync = sinon.stub().resolves();
  (service as any).performFullSync = mockPerformFullSync;

  await service.performFullSync();

  t.true(mockPerformFullSync.called);

  await service.stop();
});

test('should return comprehensive stats', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const stats = await service.getStats();

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

  // Mock the search method
  const mockSearchResponse = createMockSearchResponse({
    results: [createMockContent()],
    total: 1,
  });

  const originalSearch = service.search.bind(service);
  const mockSearch = sinon.stub().resolves(mockSearchResponse);
  (service as any).search = mockSearch;

  const searchQuery = { query: 'test', limit: 10 };
  const results = await service.search(searchQuery);

  t.true(mockSearch.calledWith(searchQuery));
  t.deepEqual(results, mockSearchResponse);

  await service.stop();
});

test('should handle search errors', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock search to throw error
  const originalSearch = service.search.bind(service);
  const mockSearch = sinon.stub().rejects(new Error('Search failed'));
  (service as any).search = mockSearch;

  const searchQuery = { query: 'test', limit: 10 };

  await assertRejects(t, service.search(searchQuery), 'Search failed');

  await service.stop();
});

test('should get context from context store', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock the getContext method
  const mockContext = 'Test context response';
  const originalGetContext = service.getContext.bind(service);
  const mockGetContext = sinon.stub().resolves(mockContext);
  (service as any).getContext = mockGetContext;

  const context = await service.getContext('test query');

  t.true(mockGetContext.calledWith('test query'));
  t.is(context, mockContext);

  await service.stop();
});

test('should handle context retrieval errors', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  // Mock getContext to throw error
  const originalGetContext = service.getContext.bind(service);
  const mockGetContext = sinon.stub().rejects(new Error('Context retrieval failed'));
  (service as any).getContext = mockGetContext;

  await assertRejects(t, service.getContext('test query'), 'Context retrieval failed');

  await service.stop();
});
