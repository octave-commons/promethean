/**
 * Simple Service Types Tests
 *
 * Basic tests for service types that match actual type definitions
 */

import test from 'ava';

import type {
  UnifiedIndexerServiceConfig,
  ServiceStatus,
  UnifiedIndexerStats,
} from '../../types/service.js';
import type { ContentType, ContentSource } from '@promethean-os/persistence';

import {
  createMinimalConfig,
  createMockServiceStatus,
  createMockUnifiedIndexerStats,
} from '../utils/simple-mocks.js';

test('should create minimal service configuration', (t) => {
  const config = createMinimalConfig();

  t.is(typeof config.indexing, 'object');
  t.is(typeof config.contextStore, 'object');
  t.is(typeof config.sources, 'object');
  t.is(typeof config.sync, 'object');

  t.true(config.sources.files.enabled);
  t.false(config.sources.discord.enabled);
  t.false(config.sources.opencode.enabled);
  t.false(config.sources.kanban.enabled);
});

test('should create mock service status', (t) => {
  const status = createMockServiceStatus();

  t.is(typeof status.healthy, 'boolean');
  t.is(typeof status.indexing, 'boolean');
  t.is(typeof status.lastSync, 'number');
  t.is(typeof status.nextSync, 'number');
  t.true(Array.isArray(status.activeSources));
  t.true(Array.isArray(status.issues));
});

test('should create mock unified indexer stats', (t) => {
  const stats = createMockUnifiedIndexerStats();

  t.is(typeof stats.total, 'object');
  t.is(typeof stats.bySource, 'object');
  t.is(typeof stats.byType, 'object');
  t.is(typeof stats.lastSync, 'number');
  t.is(typeof stats.syncDuration, 'number');
  t.true(Array.isArray(stats.errors));
});

test('should validate service configuration structure', (t) => {
  const config = createMinimalConfig();

  // Check indexing config
  t.is(config.indexing.vectorStore.type, 'chromadb');
  t.is(config.indexing.metadataStore.type, 'mongodb');
  t.is(config.indexing.embedding.model, 'test-model');
  t.true(config.indexing.cache.enabled);
  t.false(config.indexing.validation.strict);

  // Check context store config
  t.is(typeof config.contextStore.collections.files, 'string');
  t.is(typeof config.contextStore.collections.discord, 'string');
  t.is(typeof config.contextStore.collections.opencode, 'string');
  t.is(typeof config.contextStore.collections.kanban, 'string');
  t.is(typeof config.contextStore.collections.unified, 'string');

  // Check sync config
  t.is(typeof config.sync.interval, 'number');
  t.is(typeof config.sync.batchSize, 'number');
  t.is(typeof config.sync.retryAttempts, 'number');
  t.is(typeof config.sync.retryDelay, 'number');
});

test('should allow service status overrides', (t) => {
  const customStatus = createMockServiceStatus({
    healthy: false,
    indexing: true,
    issues: ['Test error'],
  });

  t.false(customStatus.healthy);
  t.true(customStatus.indexing);
  t.deepEqual(customStatus.issues, ['Test error']);
});

test('should allow unified indexer stats overrides', (t) => {
  const customStats = createMockUnifiedIndexerStats({
    lastSync: 12345,
    syncDuration: 5000,
    errors: ['Sync error'],
  });

  t.is(customStats.lastSync, 12345);
  t.is(customStats.syncDuration, 5000);
  t.deepEqual(customStats.errors, ['Sync error']);
});
