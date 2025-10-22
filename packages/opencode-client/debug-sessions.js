#!/usr/bin/env node

// Simple script to inspect what's actually in the session store
import { sessionStore } from './src/index.js';

async function inspectSessionStore() {
  console.log('🔍 Inspecting session store...');

  try {
    // Get most recent entries
    const entries = await sessionStore.getMostRecent(50);
    console.log(`\n📊 Found ${entries.length} entries in session store:`);

    entries.forEach((entry, index) => {
      console.log(`\n${index + 1}. Entry ID: ${entry.id}`);
      console.log(
        `   Text: ${entry.text.substring(0, 100)}${entry.text.length > 100 ? '...' : ''}`,
      );
      console.log(`   Timestamp: ${entry.timestamp}`);

      try {
        const parsed = JSON.parse(entry.text);
        console.log(`   Parsed ID: ${parsed.id}`);
        console.log(`   Parsed Title: ${parsed.title}`);
        console.log(`   Parsed Created: ${parsed.createdAt}`);
      } catch (e) {
        console.log(`   (Could not parse as JSON)`);
      }
    });

    // Try to get specific session entries
    console.log('\n🔍 Looking for session:* entries...');
    const sessionEntries = entries.filter((entry) => entry.id && entry.id.startsWith('session:'));
    console.log(`Found ${sessionEntries.length} session entries:`);

    sessionEntries.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.id}`);
      console.log(
        `   Text: ${entry.text.substring(0, 200)}${entry.text.length > 200 ? '...' : ''}`,
      );
    });
  } catch (error) {
    console.error('❌ Error inspecting session store:', error);
  }
}

inspectSessionStore()
  .then(() => {
    console.log('\n✅ Inspection complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
