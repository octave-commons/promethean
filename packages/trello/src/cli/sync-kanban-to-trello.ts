#!/usr/bin/env node

/**
 * CLI for syncing kanban tasks to Trello boards
 */

import { config } from 'dotenv';
import { KanbanToTrelloSync } from '../lib/kanban-to-trello-sync.js';

// Load environment variables
config();

interface CliOptions {
  boardName?: string;
  maxTasks?: number;
  dryRun?: boolean;
  createBoard?: boolean;
  archiveExisting?: boolean;
  fullSync?: boolean;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--board':
      case '-b':
        options.boardName = args[++i];
        break;
      case '--max-tasks':
      case '-m':
        options.maxTasks = parseInt(args[++i], 10);
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--no-create':
        options.createBoard = false;
        break;
      case '--archive':
        options.archiveExisting = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
🚀 Kanban to Trello Sync

USAGE:
  sync-kanban-to-trello [OPTIONS]

OPTIONS:
  -b, --board <name>     Board name (default: "promethean")
  -m, --max-tasks <num>  Maximum number of tasks to sync (default: 20)
  -d, --dry-run         Show what would be done without making changes
  --archive             Archive existing lists before creating new ones
  --no-create           Don't create board if it doesn't exist
  -h, --help            Show this help message

ENVIRONMENT VARIABLES:
  ATLASIAN_API_KEY      Your Atlassian API key (Trello)
  TRELLO_API_TOKEN      Your Trello API token

EXAMPLES:
  # Basic sync (creates board if needed)
  sync-kanban-to-trello

  # Sync to specific board
  sync-kanban-to-trello --board "My Kanban Board"

  # Dry run to see what would happen
  sync-kanban-to-trello --dry-run

  # Sync only 10 tasks
  sync-kanban-to-trello --max-tasks 10

SETUP:
  1. Get your Trello API key: https://trello.com/app-key
  2. Generate a token: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=Promethean%20Sync&key=YOUR_API_KEY
  3. Set environment variables:
     export ATLASIAN_API_KEY="your_atlassian_api_key"
     export TRELLO_API_TOKEN="your_token"
`);
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Kanban to Trello Sync CLI');
    console.log('=====================================\n');

    const options = parseCliArgs();

    // Check environment variables
    const apiKey = process.env.ATLASIAN_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    if (!apiKey) {
      console.error('❌ Missing required environment variables:');
      console.error('   • ATLASIAN_API_KEY');
      console.error('\n💡 Run with --help for setup instructions');
      process.exit(1);
    }

    // Note: ATLASIAN_API_KEY can be used as Bearer token for Atlassian API
    if (!apiToken) {
      console.log('ℹ️  Using ATLASIAN_API_KEY as Bearer token (no TRELLO_API_TOKEN provided)');
    }

    // Show configuration
    console.log('📋 Configuration:');
    console.log(`   Board: ${options.boardName || 'promethean'}`);
    console.log(`   Max tasks: ${options.maxTasks || 20}`);
    console.log(`   Dry run: ${options.dryRun ? 'YES' : 'NO'}`);
    console.log(`   Create board: ${options.createBoard !== false ? 'YES' : 'NO'}`);
    console.log(`   Archive existing: ${options.archiveExisting ? 'YES' : 'NO'}\n`);

    // Create sync instance
    const sync = new KanbanToTrelloSync(
      { apiKey, apiToken },
      options
    );

    // Run sync
    const result = await sync.sync();

    // Print summary
    await sync.printSummary(result);

    if (!result.success) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };