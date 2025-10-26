#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function main() {
  try {
    console.log('📊 Checking OpenCode indexer service status...');

    // Check if PM2 is available
    try {
      const { stdout } = await execAsync('pm2 list --json');
      const processes = JSON.parse(stdout);

      const indexerProcess = processes.find((p: any) => p.name === 'opencode-indexer');

      if (indexerProcess) {
        console.log(`✅ Indexer service is running (PM2 process ${indexerProcess.pm_id})`);
        console.log(`   Status: ${indexerProcess.pm2_env.status}`);
        console.log(`   CPU: ${indexerProcess.monit.cpu}%`);
        console.log(`   Memory: ${Math.round(indexerProcess.monit.memory / 1024 / 1024)}MB`);
        console.log(`   Uptime: ${Math.round(indexerProcess.pm2_env.pm_uptime / 1000)}s`);
      } else {
        console.log('❌ Indexer service is not running');
        console.log('💡 Use "opencode indexer start" to begin active indexing');
      }
    } catch (pm2Error) {
      console.log('⚠️  PM2 not available - cannot check indexer status');
      console.log('💡 Install PM2: npm install -g pm2');
      console.log('   Or run indexer directly: opencode indexer start');
    }
  } catch (error) {
    console.error('❌ Failed to check indexer status:', error);
    process.exit(1);
  }
}

// Also allow running as script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
