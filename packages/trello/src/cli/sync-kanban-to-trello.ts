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
        const maxTasksValue = parseInt(args[++i], 10);
        if (!isNaN(maxTasksValue)) {
          options.maxTasks = maxTasksValue;
        }
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
  # Classic Trello API (recommended):
  TRELLO_API_KEY        Your Trello API key from trello.com/app-key
  TRELLO_SECRET         Your Trello API token/secret

  # OR Classic Trello API (alternative):
  TRELLO_API_KEY        Your Trello API key
  TRELLO_API_TOKEN      Your Trello API token

  # OR Atlassian Bearer Token:
  ATLASIAN_API_KEY      Your Atlassian Bearer token

  # OR Atlassian OAuth 2.0:
  ATLASSIAN_CLIENT_ID   Your Atlassian OAuth client ID
  ATLASSIAN_CLIENT_SECRET Your Atlassian OAuth client secret

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
  # Classic Trello API (recommended):
  1. Visit Atlassian Developer Console: https://developer.atlassian.com/console/
  2. Create a new project and add Trello API scopes
  3. Generate API key and token
  4. Set environment variables:
     export TRELLO_API_KEY="your_trello_api_key"
     export TRELLO_API_TOKEN="your_trello_api_token"

  # OR Atlassian API (experimental):
  1. Use Atlassian Developer Console for OAuth 2.0
  2. Set environment variable:
     export ATLASIAN_API_KEY="your_atlassian_bearer_token"
`);
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Kanban to Trello Sync CLI');
    console.log('=====================================\n');

    const options = parseCliArgs();

    // Check environment variables (support multiple authentication methods)
    const trelloApiKey = process.env.TRELLO_API_KEY;
    const trelloSecret = process.env.TRELLO_SECRET;
    const trelloApiToken = process.env.TRELLO_API_TOKEN;
    const atlassianApiKey = process.env.ATLASIAN_API_KEY;
    const atlassianClientId = process.env.ATLASSIAN_CLIENT_ID;

    let config: any = {};

    // Priority: Classic Trello API first, then others
    if (trelloApiKey && (trelloSecret || trelloApiToken)) {
      console.log('✅ Using classic Trello API authentication');
      config = {
        apiKey: trelloApiKey,
        apiToken: trelloApiToken || trelloSecret
      };
    } else if (atlassianClientId) {
      console.log('🔧 Using Atlassian OAuth 2.0 credentials');
      config = {
        clientId: atlassianClientId,
        clientSecret: process.env.ATLASSIAN_CLIENT_SECRET
      };
    } else if (atlassianApiKey) {
      console.log('ℹ️  Using Atlassian Bearer token authentication');
      config = {
        bearerToken: atlassianApiKey
      };
    } else {
      console.error('❌ Missing required environment variables:');
      console.error('   • Classic Trello API: TRELLO_API_KEY and TRELLO_SECRET');
      console.error('   • OR Classic Trello API: TRELLO_API_KEY and TRELLO_API_TOKEN');
      console.error('   • OR Atlassian Bearer Token: ATLASIAN_API_KEY');
      console.error('   • OR Atlassian OAuth 2.0: ATLASSIAN_CLIENT_ID and ATLASSIAN_CLIENT_SECRET');
      console.error('\n💡 Run with --help for setup instructions');
      process.exit(1);
    }

    // Show configuration
    console.log('📋 Configuration:');
    console.log(`   Board: ${options.boardName || 'promethean'}`);
    console.log(`   Max tasks: ${options.maxTasks || 20}`);
    console.log(`   Dry run: ${options.dryRun ? 'YES' : 'NO'}`);
    console.log(`   Create board: ${options.createBoard !== false ? 'YES' : 'NO'}`);
    console.log(`   Archive existing: ${options.archiveExisting ? 'YES' : 'NO'}\n`);

    // Create sync instance
    const sync = new KanbanToTrelloSync(config, options);

    // Run sync
    const result = await sync.sync();

    // Print summary
    await sync.printSummary(result);

    if (!result.success) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error instanceof Error ? error.message : String(error));
    if (process.env.DEBUG) {
      console.error(error instanceof Error ? error.stack : String(error));
    }
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };