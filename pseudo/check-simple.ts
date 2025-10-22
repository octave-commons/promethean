#!/usr/bin/env tsx

import { DualStoreManager } from '@promethean/persistence';

async function checkSimple() {
  console.log('🔍 Checking dual store...');

  const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
  const sessions = await sessionStore.getMostRecent(10);

  console.log(`Total entries: ${sessions.length}`);

  const sessionEntries = sessions.filter((e) => e.id && e.id.startsWith('session:ses_'));
  console.log(`Session entries: ${sessionEntries.length}`);

  sessionEntries.slice(0, 3).forEach((entry) => {
    console.log(`  ${entry.id}`);
  });

  await sessionStore.cleanup();
}

checkSimple().catch(console.error);
