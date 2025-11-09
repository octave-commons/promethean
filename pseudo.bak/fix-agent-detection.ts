#!/usr/bin/env node

/**
 * Fix Agent Task Detection Script
 *
 * This script manually updates existing sessions in MongoDB to set the isAgentTask property
 * based on session title patterns. This fixes the CLI showing "No" for agent tasks.
 */

import { DualStoreManager } from '@promethean/persistence';
import { MongoClient, Db, Collection } from 'mongodb';

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

interface SessionDocument {
  _id: any;
  id: string;
  text?: string;
  metadata?: {
    title?: string;
    isAgentTask?: boolean;
    lastUpdated?: string;
    agentDetectionFix?: string;
  };
}

async function main() {
  console.log('🔧 Starting Agent Task Detection Fix...\n');

  try {
    // Initialize stores
    console.log('📦 Initializing stores...');
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
    const agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');

    // Get MongoDB connection for direct access
    const mongoUri = process.env.MONGODB_URI || process.env.MCP_MONGO_URI;
    if (!mongoUri) {
      throw new Error('Neither MONGODB_URI nor MCP_MONGO_URI environment variables are set');
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const sessionsCollection = db.collection('sessions');

    console.log('🔍 Finding sessions that need agent task detection...\n');

    // Find all sessions that don't have isAgentTask property or have it set to false
    const sessions = (await sessionsCollection
      .find({
        $or: [{ 'metadata.isAgentTask': { $exists: false } }, { 'metadata.isAgentTask': false }],
      })
      .toArray()) as SessionDocument[];

    console.log(`📊 Found ${sessions.length} sessions to check\n`);

    let updatedCount = 0;
    let agentTaskCount = 0;

    for (const session of sessions) {
      try {
        // Parse session data if it's in text field
        let sessionData: any;
        if (session.text) {
          try {
            sessionData = JSON.parse(session.text);
          } catch (e) {
            // If parsing fails, try to get title from metadata
            sessionData = { title: session.metadata?.title || session.id };
          }
        } else {
          sessionData = { title: session.metadata?.title || session.id };
        }

        const title = sessionData.title || '';
        const shouldBeAgentTask = isAgentTask(title);

        console.log(`📝 Session: ${session.id}`);
        console.log(`   Title: ${title}`);
        console.log(`   Agent Task: ${shouldBeAgentTask ? '✅ Yes' : '❌ No'}`);

        if (shouldBeAgentTask) {
          agentTaskCount++;
        }

        // Update the session metadata with correct isAgentTask
        await sessionsCollection.updateOne(
          { _id: session._id },
          {
            $set: {
              'metadata.isAgentTask': shouldBeAgentTask,
              'metadata.lastUpdated': new Date().toISOString(),
              'metadata.agentDetectionFix': 'v1',
            },
          },
        );

        // Also update the session text if it contains session data
        if (session.text) {
          try {
            const parsedData = JSON.parse(session.text);
            parsedData.isAgentTask = shouldBeAgentTask;

            await sessionsCollection.updateOne(
              { _id: session._id },
              {
                $set: {
                  text: JSON.stringify(parsedData),
                  'metadata.lastUpdated': new Date().toISOString(),
                },
              },
            );
          } catch (e) {
            // If we can't parse the text, just update metadata
            console.log(`   ⚠️  Could not parse session text, only metadata updated`);
          }
        }

        updatedCount++;
        console.log(`   ✅ Updated\n`);
      } catch (error) {
        console.log(`   ❌ Error updating session ${session.id}: ${error}\n`);
      }
    }

    console.log(`\n🎉 Summary:`);
    console.log(`   Total sessions checked: ${sessions.length}`);
    console.log(`   Sessions updated: ${updatedCount}`);
    console.log(`   Agent tasks detected: ${agentTaskCount}`);
    console.log(`   Regular sessions: ${updatedCount - agentTaskCount}`);

    await client.close();

    console.log('\n✅ Agent Task Detection Fix completed successfully!');
    console.log('\n💡 Tip: Run "agent-cli sessions list" to verify the fixes.');
  } catch (error) {
    console.error('\n❌ Error during fix:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
