#!/usr/bin/env node

// Deep inspection of a single message entry
import { initializeStores } from './dist/initializeStores.js';
import { messageStore } from './dist/stores.js';

async function inspectSingleMessage() {
  console.log('🔍 Initializing stores...\n');
  await initializeStores();

  try {
    const messages = await messageStore.getMostRecent(1);

    if (messages.length === 0) {
      console.log('No messages found');
      return;
    }

    const message = messages[0];
    console.log('📄 FULL MESSAGE ENTRY:');
    console.log('='.repeat(50));
    console.log('ID:', message.id);
    console.log('Timestamp:', new Date(message.timestamp).toISOString());
    console.log('Full text content:');
    console.log('---');
    console.log(message.text);
    console.log('---');

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(message.text);
      console.log('\n📋 PARSED JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('\n❌ Could not parse as JSON - raw text only');
    }
  } catch (error) {
    console.error('Error inspecting message:', error);
  }
}

inspectSingleMessage().catch(console.error);
