#!/usr/bin/env node

/**
 * Test script to verify DualStoreManager cleanup functionality
 */

import { DualStoreManager } from '@promethean/persistence';

async function testCleanup() {
  console.log('Testing DualStoreManager cleanup functionality...');

  let store1 = null;
  let store2 = null;

  try {
    // Create stores
    console.log('Creating stores...');
    store1 = await DualStoreManager.create('test-cleanup-1', 'text', 'timestamp');
    store2 = await DualStoreManager.create('test-cleanup-2', 'text', 'timestamp');

    console.log('Stores created successfully');
    console.log('Store 1 name:', store1.name);
    console.log('Store 2 name:', store2.name);

    // Test basic operations
    console.log('Testing basic operations...');
    await store1.insert({
      id: 'test-1',
      text: 'Test message 1',
      timestamp: Date.now(),
      metadata: { type: 'test' },
    });

    await store2.insert({
      id: 'test-2',
      text: 'Test message 2',
      timestamp: Date.now(),
      metadata: { type: 'test' },
    });

    console.log('Basic operations completed');

    // Test cleanup
    console.log('Testing cleanup...');
    await store1.cleanup();
    await store2.cleanup();

    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCleanup();
