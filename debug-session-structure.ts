#!/usr/bin/env tsx

import { DualStoreManager } from '@promethean/persistence';

async function debugSessionStructure() {
  console.log('🔍 Debugging session structure...\n');

  // Initialize the dual store
  const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

  // Get a sample session
  const allSessions = await sessionStore.getMostRecent(1000);
  const sessionEntries = allSessions.filter(
    (entry) => entry.id && entry.id.startsWith('session:ses_601a57b9'),
  );

  if (sessionEntries.length > 0) {
    const entry = sessionEntries[0];
    console.log(`📋 Session Entry: ${entry.id || 'undefined'}`);
    console.log(`📝 Raw text: ${entry.text}`);

    try {
      const sessionData = JSON.parse(entry.text);
      console.log(`\n🔍 Parsed session data:`);
      console.log(`  id: ${sessionData.id}`);
      console.log(`  title: ${sessionData.title}`);
      console.log(`  isAgentTask: ${sessionData.isAgentTask}`);
      console.log(`  agentTaskStatus: ${sessionData.agentTaskStatus}`);
      console.log(`  messageCount: ${sessionData.messageCount}`);
      console.log(`  activityStatus: ${sessionData.activityStatus}`);
      console.log(`  createdAt: ${sessionData.createdAt}`);
      console.log(`  lastActivityTime: ${sessionData.lastActivityTime}`);

      console.log(`\n📊 Metadata:`);
      if (entry.metadata) {
        console.log(`  title: ${entry.metadata.title}`);
        console.log(`  isAgentTask: ${entry.metadata.isAgentTask}`);
        console.log(`  agentTaskStatus: ${entry.metadata.agentTaskStatus}`);
        console.log(`  source: ${entry.metadata.source}`);
      }
    } catch (e) {
      console.log(`❌ Failed to parse JSON: ${e}`);
    }
  } else {
    console.log('❌ No session entries found');
  }

  await sessionStore.cleanup();
}

debugSessionStructure().catch(console.error);
