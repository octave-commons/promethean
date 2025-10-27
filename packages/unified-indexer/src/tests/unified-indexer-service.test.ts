/**
 * Unit Tests for UnifiedIndexerService
 *
 * Tests for service lifecycle, configuration, and core functionality
 */

import test from 'ava';

import { UnifiedIndexerService } from '../unified-indexer-service.js';
import { createMinimalConfig } from './utils/mock-factories.js';

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

test('should handle search functionality', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const searchQuery = { query: 'test', limit: 10 };
  const results = await service.search(searchQuery);

  t.truthy(results);
  t.true(Array.isArray(results.results));
  t.true(typeof results.total === 'number');
  t.true(typeof results.took === 'number');

  await service.stop();
});

test('should handle context retrieval', async (t) => {
  const config = createMinimalConfig();
  const service = new UnifiedIndexerService(config);

  await service.initialize();

  const context = await service.getContext(['test query']);

  t.truthy(context);
  t.true(Array.isArray(context));

  await service.stop();
});

test('should start and stop service correctly', async (t) => {
  const config = createMinimalConfig();
  config.sync.interval = 100; // Short interval for testing
  const service = new UnifiedIndexerService(config);

  await service.initialize();
  await service.start();

  const status = await service.getStatus();
  t.true(status.healthy);

  await service.stop();

  const finalStatus = await service.getStatus();
  t.false(finalStatus.indexing);
});
