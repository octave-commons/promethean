#!/usr/bin/env tsx

import { DualStoreManager } from '@promethean/persistence';

async function checkDualStoreContent() {
  console.log('🔍 Checking current dual store content...\n');

  // Initialize the dual store
  const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

  // Get all entries
  const allEntries = await sessionStore.getMostRecent(50);
  const sessionEntries = allEntries.filter((entry) => entry.id && entry.id.startsWith('session:'));

  console.log(`📝 Total session entries: ${sessionEntries.length}`);
  console.log('\n📋 Session entries:');

  sessionEntries.forEach((entry) => {
    try {
      const sessionData = JSON.parse(entry.text);
      console.log(`  ${entry.id} - ${sessionData.title} (Agent: ${sessionData.isAgentTask})`);
    } catch (e) {
      console.log(`  ${entry.id} - Invalid JSON`);
    }
  });

  await sessionStore.cleanup();
}

checkDualStoreContent().catch(console.error);
