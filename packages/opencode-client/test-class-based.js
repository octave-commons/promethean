#!/usr/bin/env node

// Simple test script to verify class-based implementation works
// This bypasses AVA/ts-node issues

const path = require('path');
const { DualStoreManager } = require('../dist/dualStore');

async function testDualStoreManager() {
  console.log('🧪 Testing DualStoreManager class-based implementation...');

  try {
    // Test 1: Static create method
    console.log('✅ Test 1: Testing DualStoreManager.create()...');
    const store = DualStoreManager.create();

    if (!store) {
      throw new Error('DualStoreManager.create() returned null/undefined');
    }

    console.log('✅ DualStoreManager created successfully');
    console.log('✅ Store type:', typeof store);
    console.log('✅ Store constructor name:', store.constructor.name);

    // Test 2: Check if it has expected methods
    const expectedMethods = ['get', 'set', 'has', 'delete', 'clear'];
    console.log('✅ Test 2: Checking expected methods...');

    for (const method of expectedMethods) {
      if (typeof store[method] !== 'function') {
        throw new Error(`Missing method: ${method}`);
      }
      console.log(`  ✅ Has method: ${method}`);
    }

    // Test 3: Basic operations
    console.log('✅ Test 3: Testing basic operations...');

    await store.set('test-key', { value: 'test-data' });
    console.log('  ✅ Set operation successful');

    const hasValue = await store.has('test-key');
    if (!hasValue) {
      throw new Error('Has operation failed');
    }
    console.log('  ✅ Has operation successful');

    const getValue = await store.get('test-key');
    if (!getValue || getValue.value !== 'test-data') {
      throw new Error('Get operation failed');
    }
    console.log('  ✅ Get operation successful:', getValue);

    await store.delete('test-key');
    const hasAfterDelete = await store.has('test-key');
    if (hasAfterDelete) {
      throw new Error('Delete operation failed');
    }
    console.log('  ✅ Delete operation successful');

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
