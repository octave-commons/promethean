#!/usr/bin/env node

/**
 * Fix Agent Task Detection Script for Dual Store
 *
 * This script updates existing sessions in the dual store to set the isAgentTask property
 * based on session title patterns. This fixes the CLI showing "No" for agent tasks.
 */

import { DualStoreManager } from '@promethean/persistence';

// Agent task detection patterns
const AGENT_PATTERNS = [
  /\(@\w+-developer subagent\)/i, // (@fullstack-developer subagent)
  /\(@\w+ subagent\)/i, // (@agent subagent)
  /\bagent\b/i, // contains "agent"
  /\bAI\b/i, // contains "AI"
  /\bLLM\b/i, // contains "LLM"
  /\bOpenAI\b/i, // contains "OpenAI"
  /\bClaude\b/i, // contains "Claude"
  /\bGPT\b/i, // contains "GPT"
];

function isAgentTask(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  return AGENT_PATTERNS.some((pattern) => pattern.test(title));
}

function parseSessionData(session: any): any {
  try {
    return JSON.parse(session.text);
  } catch (error) {
    // Handle legacy plain text format - extract session ID from text
    const text = session.text;
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    if (sessionMatch) {
      return {
        id: sessionMatch[1],
        title: `Session ${sessionMatch[1]}`,
        createdAt: session.timestamp || new Date().toISOString(),
        time: {
          created: session.timestamp || new Date().toISOString(),
        },
      };
    }
    // Fallback - create minimal session object
    return {
      id: session.id || 'unknown',
      title: 'Legacy Session',
      createdAt: session.timestamp || new Date().toISOString(),
      time: {
        created: session.timestamp || new Date().toISOString(),
      },
    };
  }
}

async function main() {
  console.log('🔧 Starting Agent Task Detection Fix for Dual Store...\n');

  try {
    // Initialize session store
    console.log('📦 Initializing session store...');
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

    console.log('🔍 Finding sessions that need agent task detection...\n');

    // Get sessions from dual store
    const storedSessions = await sessionStore.getMostRecent(1000);
    console.log(`📊 Found ${storedSessions.length} sessions to check\n`);

    let updatedCount = 0;
    let agentTaskCount = 0;
    let alreadyCorrectCount = 0;

    for (const session of storedSessions) {
      try {
        // Parse session data
        const sessionData = parseSessionData(session);
        const title = sessionData.title || '';
        const shouldBeAgentTask = isAgentTask(title);
        const currentlyIsAgentTask = sessionData.isAgentTask || false;

        console.log(`📝 Session: ${session.id}`);
        console.log(`   Title: ${title}`);
        console.log(`   Current Agent Task: ${currentlyIsAgentTask ? '✅ Yes' : '❌ No'}`);
        console.log(`   Should Be Agent Task: ${shouldBeAgentTask ? '✅ Yes' : '❌ No'}`);

        if (currentlyIsAgentTask === shouldBeAgentTask) {
          console.log(`   ✅ Already correct\n`);
          alreadyCorrectCount++;
          continue;
        }

        if (shouldBeAgentTask) {
          agentTaskCount++;
        }

        // Update the session data with correct isAgentTask
        sessionData.isAgentTask = shouldBeAgentTask;
        sessionData.agentDetectionFix = 'v1';
        sessionData.lastUpdated = new Date().toISOString();

        // Update the session in the store
        await sessionStore.insert({
          id: session.id,
          text: JSON.stringify(sessionData),
          timestamp: session.timestamp || Date.now(),
          metadata: {
            ...session.metadata,
            isAgentTask: shouldBeAgentTask,
            lastUpdated: new Date().toISOString(),
            agentDetectionFix: 'v1',
          },
        });

        updatedCount++;
        console.log(`   ✅ Updated\n`);
      } catch (error) {
        console.log(`   ❌ Error updating session ${session.id}: ${error}\n`);
      }
    }

    console.log(`\n🎉 Summary:`);
    console.log(`   Total sessions checked: ${storedSessions.length}`);
    console.log(`   Sessions already correct: ${alreadyCorrectCount}`);
    console.log(`   Sessions updated: ${updatedCount}`);
    console.log(`   Agent tasks detected: ${agentTaskCount}`);
    console.log(`   Regular sessions: ${updatedCount - agentTaskCount}`);

    console.log('\n✅ Agent Task Detection Fix completed successfully!');
    console.log('\n💡 Tip: Run "agent-cli sessions list" to verify the fixes.');
  } catch (error) {
    console.error('\n❌ Error during fix:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
