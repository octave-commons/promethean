#!/usr/bin/env node

// Simple test script to verify class-based implementation works
// This bypasses AVA/ts-node issues

import { DualStoreManager } from '../persistence/dist/dualStore.js';

async function testDualStoreManager() {
  console.log('🧪 Testing DualStoreManager class-based implementation...');

  try {
    // Test 1: Static create method
    console.log('✅ Test 1: Testing DualStoreManager.create()...');
    const storePromise = DualStoreManager.create();

    if (!storePromise) {
      throw new Error('DualStoreManager.create() returned null/undefined');
    }

    console.log('✅ DualStoreManager.create() returned a promise');
    console.log('✅ Store promise type:', typeof storePromise);
    console.log('✅ Store promise constructor name:', storePromise.constructor.name);

    // Await the store creation
    const store = await storePromise;

    if (!store) {
      throw new Error('DualStoreManager.create() promise resolved to null/undefined');
    }

    console.log('✅ DualStoreManager created successfully');
    console.log('✅ Store type:', typeof store);
    console.log('✅ Store constructor name:', store.constructor.name);

    // Test 2: Check if it has expected methods
    const expectedMethods = [
      'insert',
      'addEntry',
      'getMostRecent',
      'getMostRelevant',
      'get',
      'cleanup',
    ];
    console.log('✅ Test 2: Checking expected methods...');

    for (const method of expectedMethods) {
      if (typeof store[method] !== 'function') {
        throw new Error(`Missing method: ${method}`);
      }
      console.log(`  ✅ Has method: ${method}`);
    }

    // Test 3: Basic operations
    console.log('✅ Test 3: Testing basic operations...');

    const testEntry = {
      text: 'test-data',
      metadata: { type: 'test', value: 'test-data' },
    };

    await store.insert(testEntry);
    console.log('  ✅ Insert operation successful');

    const recentEntries = await store.getMostRecent(1);
    if (!recentEntries || recentEntries.length === 0) {
      throw new Error('getMostRecent operation failed');
    }
    console.log('  ✅ getMostRecent operation successful:', recentEntries[0].text);

    // Get the ID from the inserted entry
    const insertedId = recentEntries[0].id;
    const getValue = await store.get(insertedId);
    if (!getValue || getValue.text !== 'test-data') {
      throw new Error('Get operation failed');
    }
    console.log('  ✅ Get operation successful:', getValue.text);

    console.log('  ✅ All basic operations successful');

    console.log('🎉 All tests passed! Class-based implementation is working correctly.');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testDualStoreManager().then((success) => {
  process.exit(success ? 0 : 1);
});
