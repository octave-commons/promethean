#!/usr/bin/env tsx

import { DualStoreManager } from '@promethean/persistence';

async function debugCliSessions() {
  console.log('🔍 Debugging CLI sessions vs dual store...\n');

  // Initialize the same dual store the CLI uses
  const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

  // The session IDs from CLI output
  const cliSessionIds = [
    'ses_6023941c',
    'ses_601927be',
    'ses_601f5cb3',
    'ses_601b5b05',
    'ses_601a57b9',
  ];

  console.log('📋 CLI Session IDs to check:');
  cliSessionIds.forEach((id) => console.log(`  - ${id}`));
  console.log('');

  // Get all sessions from dual store
  const allSessions = await sessionStore.getMostRecent(1000);
  console.log(`📦 Total entries in dual store: ${allSessions.length}`);
  console.log('');

  // Filter for session entries (not events/messages)
  const sessionEntries = allSessions.filter((entry) => entry.id.startsWith('session:'));
  console.log(`📝 Session entries: ${sessionEntries.length}`);
  console.log('');

  // Check each CLI session ID
  console.log('🔍 Checking each CLI session:');
  for (const cliId of cliSessionIds) {
    // Look for exact match
    const exactMatch = sessionEntries.find((entry) => entry.id === `session:${cliId}`);

    // Look for partial match (in case ID is truncated)
    const partialMatch = sessionEntries.find((entry) => entry.id.includes(cliId));

    console.log(`\n📍 Session ID: ${cliId}`);
    console.log(`  Exact match (session:${cliId}): ${exactMatch ? '✅ Found' : '❌ Not found'}`);
    console.log(
      `  Partial match: ${partialMatch ? '✅ Found (' + partialMatch.id + ')' : '❌ Not found'}`,
    );

    if (exactMatch) {
      try {
        const sessionData = JSON.parse(exactMatch.text);
        console.log(`  Title: ${sessionData.title || 'No title'}`);
        console.log(
          `  Created: ${sessionData.createdAt || sessionData.time?.created || 'No timestamp'}`,
        );
        console.log(`  isAgentTask: ${sessionData.isAgentTask || 'Not set'}`);
      } catch (e) {
        console.log(`  Raw text: ${exactMatch.text.substring(0, 100)}...`);
      }
    }
  }

  // Show all session entry IDs for comparison
  console.log('\n📋 All session entry IDs in dual store:');
  sessionEntries.slice(0, 20).forEach((entry) => {
    console.log(`  ${entry.id}`);
  });
  if (sessionEntries.length > 20) {
    console.log(`  ... and ${sessionEntries.length - 20} more`);
  }

  await sessionStore.cleanup();
}

debugCliSessions().catch(console.error);
