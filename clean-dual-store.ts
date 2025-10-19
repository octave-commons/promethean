#!/usr/bin/env tsx

import { DualStoreManager } from '@promethean/persistence';

async function cleanDualStore() {
  console.log('🧹 Cleaning up corrupted dual store entries...\n');

  // Initialize the dual store
  const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

  // Get all entries
  const allEntries = await sessionStore.getMostRecent(2000);
  console.log(`📦 Total entries: ${allEntries.length}`);

  // Separate different types of entries
  const realSessions = allEntries.filter(
    (entry) =>
      entry.id && (entry.id.startsWith('session:ses_') || entry.id.startsWith('session:test_')),
  );

  const corruptedEntries = allEntries.filter(
    (entry) =>
      entry.id &&
      (entry.id.includes('session:session:') ||
        entry.id.includes('session:event:') ||
        entry.id.startsWith('event:') ||
        entry.id.includes('session-event:')),
  );

  const otherEntries = allEntries.filter(
    (entry) => entry.id && !realSessions.includes(entry) && !corruptedEntries.includes(entry),
  );

  console.log(`📝 Real sessions: ${realSessions.length}`);
  console.log(`🗑️  Corrupted entries: ${corruptedEntries.length}`);
  console.log(`📋 Other entries: ${otherEntries.length}`);

  // Show sample of corrupted entries
  if (corruptedEntries.length > 0) {
    console.log('\n🔍 Sample corrupted entries:');
    corruptedEntries.slice(0, 10).forEach((entry) => {
      console.log(`  ${entry.id}`);
    });
  }

  // Show real sessions
  if (realSessions.length > 0) {
    console.log('\n✅ Real sessions found:');
    realSessions.forEach((entry) => {
      try {
        const sessionData = JSON.parse(entry.text);
        console.log(
          `  ${entry.id} - ${sessionData.title || 'No title'} (isAgentTask: ${sessionData.isAgentTask || false})`,
        );
      } catch (e) {
        console.log(`  ${entry.id} - Invalid JSON`);
      }
    });
  }

  // Clean up corrupted entries
  console.log('\n🗑️  Removing corrupted entries...');
  let removedCount = 0;

  for (const corrupted of corruptedEntries) {
    try {
      await sessionStore.remove(corrupted.id);
      removedCount++;
    } catch (error) {
      console.log(`❌ Failed to remove ${corrupted.id}: ${error}`);
    }
  }

  console.log(`✅ Removed ${removedCount} corrupted entries`);

  // Verify cleanup
  const remainingEntries = await sessionStore.getMostRecent(2000);
  const remainingCorrupted = remainingEntries.filter(
    (entry) =>
      entry.id &&
      (entry.id.includes('session:session:') ||
        entry.id.includes('session:event:') ||
        entry.id.startsWith('event:') ||
        entry.id.includes('session-event:')),
  );

  console.log(`📊 Remaining entries: ${remainingEntries.length}`);
  console.log(`🗑️  Remaining corrupted: ${remainingCorrupted.length}`);

  await sessionStore.cleanup();
  console.log('\n✅ Dual store cleanup completed!');
}

cleanDualStore().catch(console.error);
