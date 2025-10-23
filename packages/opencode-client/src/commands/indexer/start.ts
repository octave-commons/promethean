#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { createIndexerService } from '../../services/indexer.js';

export async function main() {
  try {
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose');

    // For now, use the correct default URL since commander options aren't properly passed
    const baseUrl = 'http://localhost:4096';

    const indexer = createIndexerService({ baseUrl });

    // Start in foreground (current behavior)
    console.log('🚀 Starting OpenCode indexer service in foreground...');
    if (verbose) {
      console.log('🔊 Verbose mode enabled');
    }
    console.log('💡 Use --pm2 to run as background daemon');

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
