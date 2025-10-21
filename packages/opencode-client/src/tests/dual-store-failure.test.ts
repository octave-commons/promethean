#!/usr/bin/env node

/**
 * Real Dual Store Failure Test
 * Tests dual store failure by pointing it at a non-existent database
 * This simulates real infrastructure failure (network, server down, etc.)
 */

import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';
import { get, list } from '../actions/sessions/index.js';
import { initializeStores } from '../index.js';

test.serial('Real dual store failure - non-existent database', async (t) => {
  // Save original environment
  const originalMongoUrl = process.env.MONGO_URL;

  try {
    // Override environment to point to non-existent database
    process.env.MONGO_URL = 'mongodb://localhost:27999/nonexistent_db'; // Wrong port

    // Try to create dual store - this should fail during initialization
    const failingStore = await DualStoreManager.create('nonexistent_db_test', 'text', 'timestamp');
    const failingAgentStore = await DualStoreManager.create(
      'nonexistent_agent_db_test',
      'text',
      'timestamp',
    );

    // Initialize with failing stores
    initializeStores(failingStore, failingAgentStore);

    // Initialize with failing stores
    initializeStores(failingStore, failingAgentStore);

    // Test get operation with failing dual store
    const getResult = await get({
      sessionId: 'test-session',
    });

    // Should fail fast and hard, not fallback to client
    t.true(typeof getResult === 'string');
    t.true(getResult.includes('Failed') || getResult.includes('Error'));

    // Test list operation with failing dual store
    const listResult = await list({
      limit: 10,
      offset: 0,
    });

    // Should also fail fast and hard
    t.true(typeof listResult === 'string');
    t.true(listResult.includes('Failed') || listResult.includes('Error'));

    console.log('Dual store failure results:');
    console.log('Get result:', getResult);
    console.log('List result:', listResult);
  } finally {
    // Restore original environment
    if (originalMongoUrl) {
      process.env.MONGO_URL = originalMongoUrl;
    } else {
      delete process.env.MONGO_URL;
    }
  }
});

test.serial('Working dual store for comparison', async (t) => {
  // Test with working dual store to show the difference
  const workingStore = await DualStoreManager.create('working_db_test', 'text', 'timestamp');
  const workingAgentStore = await DualStoreManager.create(
    'working_agent_db_test',
    'text',
    'timestamp',
  );

  initializeStores(workingStore, workingAgentStore);

  // Insert test data
  await workingStore.insert({
    id: 'session:working-test',
    text: JSON.stringify({
      id: 'working-test',
      title: 'Working Test Session',
      createdAt: new Date().toISOString(),
    }),
    timestamp: new Date().toISOString(),
    metadata: {
      type: 'session',
      sessionId: 'working-test',
    },
  });

  // Should work fine with dual store
  const getResult = await get({
    sessionId: 'working-test',
  });

  const sessionData = JSON.parse(getResult);
  t.truthy(sessionData.session);
  t.is(sessionData.session.title, 'Working Test Session');

  console.log('Working dual store result: Success');
});
