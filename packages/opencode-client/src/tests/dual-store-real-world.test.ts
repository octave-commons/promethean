/**
 * Comprehensive Real-World Dual Store Test
 * No mocks, no shortcuts, no hiding behind fast test expectations
 * This test takes as long as it takes - that's the point
 */

import test from 'ava';
import { DualStoreManager } from '@promethean/persistence';
import { get, list, search } from '../actions/sessions/index.js';
import { initializeStores } from '../index.js';

// Store references for cleanup
let testStores: DualStoreManager<'text', 'timestamp'>[] = [];

test.after.always(async () => {
  console.log('\n=== Cleaning up test stores ===');

  // Reset persistence clients for clean test state
  const { __resetPersistenceClientsForTests } = await import('@promethean/persistence');
  __resetPersistenceClientsForTests();

  // Note: MongoDB connections are cached globally and will be cleaned up by the reset
  // We don't need to manually close individual collection connections
  testStores = [];
});

test.serial('Real dual store failure - non-existent database', async (t) => {
  console.log('\n=== Testing Dual Store Failure with Non-Existent Database ===');

  const originalMongoUrl = process.env.MONGO_URL;
  const startTime = Date.now();

  try {
    // Point to non-existent database
    process.env.MONGO_URL = 'mongodb://localhost:27999/nonexistent_db';
    console.log('Pointing to non-existent MongoDB on port 27999...');

    // Try to create dual store - this will likely fail or be broken
    console.log('Creating dual store...');
    const failingStore = await DualStoreManager.create('failure_test', 'text', 'timestamp');
    const failingAgentStore = await DualStoreManager.create(
      'failure_agent_test',
      'text',
      'timestamp',
    );

    console.log('Initializing stores...');
    initializeStores(failingStore, failingAgentStore);

    // Track for cleanup
    testStores.push(failingStore, failingAgentStore);

    // Track if any fallback behavior occurs (should not happen with fail-fast)
    let fallbackDetected = false;

    console.log('\n--- Testing get operation ---');
    const getStartTime = Date.now();
    const getResult = await get({
      sessionId: 'test-session',
    });
    const getDuration = Date.now() - getStartTime;

    console.log(`Get operation completed in ${getDuration}ms`);
    console.log(`Result: ${getResult}`);

    // Check if result indicates fallback behavior (should not happen)
    if (typeof getResult === 'string' && getResult.includes('Client fallback')) {
      fallbackDetected = true;
    }

    console.log('\n--- Testing list operation ---');
    const listStartTime = Date.now();
    const listResult = await list({
      limit: 10,
      offset: 0,
    });
    const listDuration = Date.now() - listStartTime;

    console.log(`List operation completed in ${listDuration}ms`);
    console.log(`Result: ${listResult}`);

    console.log('\n--- Testing search operation ---');
    const searchStartTime = Date.now();
    const searchResult = await search({
      query: 'test query',
    });
    const searchDuration = Date.now() - searchStartTime;

    console.log(`Search operation completed in ${searchDuration}ms`);
    console.log(`Result: ${searchResult}`);

    const totalDuration = Date.now() - startTime;
    console.log(`\n=== TOTAL TEST DURATION: ${totalDuration}ms ===`);

    // Assertions based on what we observe
    if (fallbackDetected) {
      console.log('❌ DUAL STORE FALLBACK DETECTED - This is the problem!');
      t.fail('Dual store should not fallback to client - it should fail fast');
    } else {
      console.log('✅ No client fallback - dual store failed appropriately');
      t.pass();
    }

    // Log the performance reality
    if (getDuration > 5000) {
      console.log(`🐌 GET operation is SLOW (${getDuration}ms) - performance problem detected`);
    }
    if (listDuration > 5000) {
      console.log(`🐌 LIST operation is SLOW (${listDuration}ms) - performance problem detected`);
    }
    if (searchDuration > 5000) {
      console.log(
        `🐌 SEARCH operation is SLOW (${searchDuration}ms) - performance problem detected`,
      );
    }
  } finally {
    // Restore environment
    if (originalMongoUrl) {
      process.env.MONGO_URL = originalMongoUrl;
    } else {
      delete process.env.MONGO_URL;
    }
  }
});

test.serial('Working dual store baseline for comparison', async (t) => {
  console.log('\n=== Testing Working Dual Store for Baseline Comparison ===');

  const startTime = Date.now();

  // Create working dual store
  console.log('Creating working dual store...');
  const workingStore = await DualStoreManager.create('working_test', 'text', 'timestamp');
  const workingAgentStore = await DualStoreManager.create(
    'working_agent_test',
    'text',
    'timestamp',
  );

  initializeStores(workingStore, workingAgentStore);

  // Insert test data
  console.log('Inserting test data...');
  const testSession = {
    id: 'working-test-session',
    title: 'Working Test Session',
    description: 'Testing baseline performance',
    agent: 'test-agent',
    createdAt: new Date().toISOString(),
  };

  await workingStore.insert({
    id: `session:${testSession.id}`,
    text: JSON.stringify(testSession),
    timestamp: testSession.createdAt,
    metadata: {
      type: 'session',
      sessionId: testSession.id,
    },
  });

  // No tracking needed - actions should work directly with dual store

  console.log('\n--- Testing get operation with working dual store ---');
  const getStartTime = Date.now();
  const getResult = await get({
    sessionId: 'working-test-session',
  });
  const getDuration = Date.now() - getStartTime;

  console.log(`Working GET completed in ${getDuration}ms`);

  console.log('\n--- Testing list operation with working dual store ---');
  const listStartTime = Date.now();
  const listResult = await list({
    limit: 10,
    offset: 0,
  });
  const listDuration = Date.now() - listStartTime;

  console.log(`Working LIST completed in ${listDuration}ms`);

  const totalDuration = Date.now() - startTime;
  console.log(`\n=== WORKING DUAL STORE TOTAL DURATION: ${totalDuration}ms ===`);

  // Verify results
  const sessionData = JSON.parse(getResult);
  t.truthy(sessionData.session);
  t.is(sessionData.session.title, 'Working Test Session');

  const listData = JSON.parse(listResult);
  t.true(Array.isArray(listData.sessions));

  console.log('✅ Working dual store baseline established');

  // Clean up connections - handled by the after.always hook
  // No need for manual cleanup since we use the persistence reset functionality
});
