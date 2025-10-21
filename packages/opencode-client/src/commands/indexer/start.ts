#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { createIndexerService } from '../../services/indexer.js';

const execAsync = promisify(exec);

export async function main() {
  try {
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose');
    const usePm2 = args.includes('--pm2');
    const indexer = createIndexerService();

    if (usePm2) {
      // Start as PM2 daemon
      console.log('🚀 Starting OpenCode indexer service as PM2 daemon...');

      const scriptArgs = verbose ? ['--verbose'] : [];
      const pm2Command = `pm2 start dist/cli.js --name "opencode-indexer" -- indexer start ${scriptArgs.join(' ')}`;

      try {
        await execAsync(pm2Command);
        console.log('✅ Indexer service started as PM2 daemon!');
        console.log('💡 Use "opencode indexer status" to check status');
        console.log('💡 Use "opencode indexer stop" to stop the daemon');
      } catch (pm2Error) {
        console.error('❌ Failed to start PM2 daemon:', pm2Error);
        console.log('💡 Make sure PM2 is installed: npm install -g pm2');
        process.exit(1);
      }
    } else {
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
    }
  } catch (error) {
    console.error('❌ Failed to start indexer service:', error);
    process.exit(1);
  }
}

// Also allow running as script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
