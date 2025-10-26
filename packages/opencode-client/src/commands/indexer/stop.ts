#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function main() {
  try {
    console.log('🛑 Stopping OpenCode indexer service...');

    try {
      // Try to stop PM2 daemon first
      await execAsync('pm2 stop opencode-indexer');
      await execAsync('pm2 delete opencode-indexer');
      console.log('✅ Indexer service PM2 daemon stopped successfully!');
    } catch (pm2Error) {
      // PM2 process not found, that's okay
      console.log('ℹ️  No PM2 daemon found');
    }

    console.log('💡 If running in foreground, use Ctrl+C to stop');
  } catch (error) {
    console.error('❌ Failed to stop indexer service:', error);
    process.exit(1);
  }
}

// Also allow running as script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
