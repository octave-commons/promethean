#!/usr/bin/env node

/**
 * Test Trello API connection and authentication
 */

import { config } from 'dotenv';
import { TrelloClient } from './lib/trello-client.js';

// Load environment variables
config();

async function testConnection(): Promise<void> {
  console.log('🔍 Testing Trello API Connection');
  console.log('===============================\n');

  const apiKey = process.env.TRELLO_API_KEY;
  const apiToken = process.env.TRELLO_API_TOKEN;

  if (!apiKey) {
    console.log('❌ TRELLO_API_KEY not found');
    console.log('💡 Add to your .env file: TRELLO_API_KEY=your_api_key');
    console.log('📋 Get your key at: https://trello.com/app-key');
    return;
  }

  if (!apiToken) {
    console.log('❌ TRELLO_API_TOKEN not found');
    console.log('💡 Add to your .env file: TRELLO_API_TOKEN=your_token');
    console.log(
      '📋 Generate token at: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=Promethean%20Sync&key=' +
        apiKey,
    );
    return;
  }

  console.log('✅ API Key found');
  console.log('✅ API Token found');
  console.log(`🔑 Key: ${apiKey.substring(0, 8)}...`);
  console.log(`🔑 Token: ${apiToken.substring(0, 8)}...\n`);

  try {
    const client = new TrelloClient({ apiKey, apiToken });

    console.log('🔄 Testing connection...');
    const connected = await client.testConnection();

    if (connected) {
      console.log('\n🎉 Connection successful!');
      console.log('🚀 Ready to sync kanban tasks to Trello!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run: pnpm sync:trello');
      console.log('   2. Or: node packages/trello/src/cli/sync-kanban-to-trello.ts');
      console.log('   3. Or: pnpm run sync:trello:dev (for development)');
    }
  } catch (error) {
    console.error(
      '\n❌ Connection failed:',
      error instanceof Error ? error.message : String(error),
    );
    console.log('\n💡 Troubleshooting:');
    console.log('   • Check that your API key is correct');
    console.log('   • Verify your token has read and write permissions');
    console.log('   • Make sure the token was generated with the correct key');
    console.log('   • Check your internet connection');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection();
}

export { testConnection };
