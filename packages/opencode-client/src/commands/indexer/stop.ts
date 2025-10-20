#!/usr/bin/env node

import { IndexerService } from '../../services/indexer.js';

async function main() {
  try {
    const indexer = new IndexerService();

    console.log('🛑 Stopping OpenCode indexer service...');
    await indexer.stop();

    console.log('✅ Indexer service stopped successfully!');
  } catch (error) {
    console.error('❌ Failed to stop indexer service:', error);
    process.exit(1);
  }
}

main();
