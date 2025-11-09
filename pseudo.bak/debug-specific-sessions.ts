#!/usr/bin/env node

/**
 * Debug Specific Sessions Script
 *
 * This script looks for the specific session IDs we saw in the CLI output
 */

import { DualStoreManager } from '@promethean/persistence';

async function main() {
  console.log('🔍 Debugging Specific Sessions...\n');

  try {
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
    const storedSessions = await sessionStore.getMostRecent(1000);

    // Look for the specific session IDs we saw in CLI
    const targetIds = [
      'ses_6023941c',
      'ses_601b5b05',
      'ses_601a57b9',
      'ses_60214e36',
      'ses_601f5cb3',
    ];

    for (const targetId of targetIds) {
      console.log(`\n🔍 Looking for session starting with: ${targetId}`);

      const matches = storedSessions.filter(
        (session) => session.id && session.id.startsWith(targetId),
      );

      if (matches.length === 0) {
        console.log(`   ❌ No matches found`);
      } else {
        for (const match of matches) {
          console.log(`   ✅ Found: ${match.id}`);
          try {
            const parsed = JSON.parse(match.text);
            console.log(`       Title: ${parsed.title || '(no title)'}`);
            console.log(`       isAgentTask: ${parsed.isAgentTask || false}`);
            console.log(`       Full data:`, JSON.stringify(parsed, null, 6));
          } catch (e) {
            console.log(`       Text: ${match.text.substring(0, 200)}...`);
          }
        }
      }
    }

    // Also check what patterns the actual session IDs follow
    console.log(`\n📊 Session ID patterns in store:`);
    const idPatterns = new Map();

    for (const session of storedSessions) {
      if (session.id) {
        const pattern = session.id.split(':')[0]; // Get part before first colon
        idPatterns.set(pattern, (idPatterns.get(pattern) || 0) + 1);
      }
    }

    for (const [pattern, count] of idPatterns.entries()) {
      if (count > 5) {
        // Only show patterns with more than 5 occurrences
        console.log(`   ${pattern}: ${count} entries`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
