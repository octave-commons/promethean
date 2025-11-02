#!/usr/bin/env node

/**
 * Test script to verify history scanning functionality
 */

import { createIndexerService } from './dist/services/indexer.js';

async function testHistoryScan() {
  console.log('🧪 Testing history scanning functionality...');

  try {
    const indexer = createIndexerService({
      baseUrl: 'http://localhost:3000',
      stateFile: './test-history-state.json',
    });

    console.log('📡 Starting history scan...');
    await indexer.scanHistory();

    console.log('✅ History scan completed successfully!');

    await indexer.cleanup();
  } catch (error) {
    console.error('❌ History scan failed:', error);
    process.exit(1);
  }
}

testHistoryScan();
