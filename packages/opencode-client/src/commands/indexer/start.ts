#!/usr/bin/env node

import { IndexerService } from '../../services/indexer.js';

export async function main() {
  try {
    const verbose = process.argv.includes('--verbose');
    const indexer = new IndexerService();

    console.log('🚀 Starting OpenCode indexer service...');
    if (verbose) {
      console.log('🔊 Verbose mode enabled');
    }
    await indexer.start();

    console.log('✅ Indexer service started successfully!');
    console.log('Press Ctrl+C to stop the indexer service');
    if (!verbose) {
      console.log('💡 Use --verbose to see detailed event logging');
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping indexer service...');
      await indexer.stop();
      console.log('✅ Indexer service stopped');
      process.exit(0);
    });

    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    console.error('❌ Failed to start indexer service:', error);
    process.exit(1);
  }
}

// Also allow running as script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
