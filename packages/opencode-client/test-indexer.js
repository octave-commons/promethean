#!/usr/bin/env node

/**
 * Test script to verify indexer service functionality
 */

import { createIndexerService } from './src/services/indexer.js';

async function testIndexer() {
  console.log('🧪 Testing indexer service creation...');

  try {
    // Create indexer service
    const indexer = createIndexerService({
      baseUrl: 'http://localhost:4096',
      processingInterval: 30000, // 30 seconds for testing
      stateFile: './test-indexer-state.json',
    });

    console.log('✅ Indexer service created successfully');
    console.log('📊 Initial stats:', indexer.getStats());

    // Test getting state (should be empty initially)
    const state = await indexer.getState();
    console.log('📋 Initial state:', {
      isRunning: state.isRunning,
      lastIndexedSessionId: state.lastIndexedSessionId,
      lastIndexedMessageId: state.lastIndexedMessageId,
    });

    console.log('🎯 Indexer service test completed successfully');
  } catch (error) {
    console.error('❌ Indexer test failed:', error);
    process.exit(1);
  }
}

testIndexer();
