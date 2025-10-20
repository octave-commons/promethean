#!/usr/bin/env node

import { IndexerService } from '../../services/indexer.js';

export async function main() {
  try {
    const indexer = new IndexerService();
    
    console.log('🚀 Starting OpenCode indexer service...');
    await indexer.start();
    
    console.log('✅ Indexer service started successfully!');
    console.log('Press Ctrl+C to stop the indexer service');
    
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
}

main();
