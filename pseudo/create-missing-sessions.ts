#!/usr/bin/env tsx

import { DualStoreManager } from '@promethean/persistence';

async function createMissingSessions() {
  console.log('🔧 Creating missing session entries...\n');

  // Initialize the dual store
  const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

  // The session IDs that CLI is showing but don't exist in dual store
  const missingSessions = [
    {
      id: 'ses_6018d28d',
      title: 'Review load-config.ts code (@code-reviewer subagent)',
      isAgentTask: true,
    },
    {
      id: 'ses_6018d573',
      title: 'Reviewing load-config.ts implementation',
      isAgentTask: true,
    },
    {
      id: 'ses_601a57b9',
      title: 'Implement OpenAI Server Security Features (@fullstack-developer subagent)',
      isAgentTask: true,
    },
    {
      id: 'ses_6023941c',
      title: 'Analyzing dual store family naming',
      isAgentTask: true,
    },
    {
      id: 'ses_601927be',
      title: 'Continue Phase 2 context migration (@fullstack-developer subagent)',
      isAgentTask: true,
    },
    {
      id: 'ses_601f5cb3',
      title: 'Analyzing packages/agents directory structure',
      isAgentTask: true,
    },
    {
      id: 'ses_601b5b05',
      title: 'Continue pantheon Phase 2 migration (@fullstack-developer subagent)',
      isAgentTask: true,
    },
    {
      id: 'ses_60214e36',
      title: 'Analyzing openai-server directory structure',
      isAgentTask: true,
    },
    {
      id: 'ses_601c155c',
      title: 'Test Session for Indexer',
      isAgentTask: false,
    },
    {
      id: 'ses_601c4f48',
      title: 'Test Session - Fixed',
      isAgentTask: false,
    },
  ];

  console.log(`📋 Creating ${missingSessions.length} missing sessions...`);

  let createdCount = 0;
  const now = new Date().toISOString();

  for (const session of missingSessions) {
    try {
      const sessionDocument = {
        id: session.id,
        title: session.title,
        messageCount: 0,
        lastActivityTime: now,
        activityStatus: 'idle',
        isAgentTask: session.isAgentTask,
        agentTaskStatus: session.isAgentTask ? 'unknown' : undefined,
        createdAt: now,
        time: {
          created: now,
          updated: now,
        },
      };

      await sessionStore.insert({
        id: `session:${session.id}`,
        text: JSON.stringify(sessionDocument),
        timestamp: Date.now(),
        metadata: {
          title: sessionDocument.title,
          messageCount: sessionDocument.messageCount,
          lastActivityTime: sessionDocument.lastActivityTime,
          activityStatus: sessionDocument.activityStatus,
          isAgentTask: sessionDocument.isAgentTask,
          agentTaskStatus: sessionDocument.agentTaskStatus,
          createdAt: sessionDocument.createdAt,
          lastUpdated: now,
          source: 'manual_fix',
        },
      });

      createdCount++;
      console.log(
        `✅ Created session: ${session.id} - ${session.title} (Agent: ${session.isAgentTask})`,
      );
    } catch (error) {
      console.log(`❌ Failed to create session ${session.id}: ${error}`);
    }
  }

  console.log(`\n📊 Created ${createdCount} out of ${missingSessions.length} sessions`);

  // Verify the sessions were created
  const allSessions = await sessionStore.getMostRecent(1000);
  const sessionEntries = allSessions.filter(
    (entry) => entry.id && entry.id.startsWith('session:ses_'),
  );

  console.log(`\n📝 Total session entries: ${sessionEntries.length}`);
  console.log('\n🔍 Sample sessions:');
  sessionEntries.slice(0, 10).forEach((entry) => {
    try {
      const sessionData = JSON.parse(entry.text);
      console.log(`  ${entry.id} - ${sessionData.title} (Agent: ${sessionData.isAgentTask})`);
    } catch (e) {
      console.log(`  ${entry.id} - Invalid JSON`);
    }
  });

  await sessionStore.cleanup();
  console.log('\n✅ Session creation completed!');
}

createMissingSessions().catch(console.error);
