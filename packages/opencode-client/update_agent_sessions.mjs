#!/usr/bin/env node

/**
 * Manually update existing sessions to have proper agent task detection
 */

import { DualStoreManager } from '@promethean/persistence';

async function updateExistingSessions() {
  console.log('🔧 Updating existing sessions with agent task detection...\n');

  try {
    // Initialize store
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
    console.log('✅ Session store initialized\n');

    // Get all recent sessions
    const recentSessions = await sessionStore.getMostRecent(50);
    console.log(`Found ${recentSessions.length} sessions to check\n`);

    let updatedCount = 0;

    for (const sessionEntry of recentSessions) {
      try {
        // Skip event entries and non-session entries
        if (!sessionEntry.id.startsWith('session:ses_')) {
          continue;
        }

        const sessionData = JSON.parse(sessionEntry.text);

        // Check if this looks like an agent session based on title
        const isAgentSession =
          sessionData.title &&
          (sessionData.title.includes('@fullstack-developer subagent') ||
            sessionData.title.includes('@general subagent') ||
            sessionData.title.includes('@frontend-specialist subagent') ||
            sessionData.title.includes('@code-reviewer subagent') ||
            sessionData.title.includes('subagent') ||
            sessionData.title.toLowerCase().includes('agent'));

        // Only update if agent detection status has changed
        if (sessionData.isAgentTask !== isAgentSession) {
          console.log(`📝 Updating session ${sessionData.id}:`);
          console.log(`   Title: ${sessionData.title}`);
          console.log(`   Agent Task: ${sessionData.isAgentTask} → ${isAgentSession}`);

          // Update session data
          const updatedSessionData = {
            ...sessionData,
            isAgentTask: isAgentSession,
            agentTaskStatus: isAgentSession ? sessionData.agentTaskStatus || 'running' : undefined,
          };

          // Re-insert with updated data
          await sessionStore.insert({
            id: sessionEntry.id,
            text: JSON.stringify(updatedSessionData),
            timestamp: Date.now(),
            metadata: {
              ...sessionEntry.metadata,
              title: updatedSessionData.title,
              isAgentTask: updatedSessionData.isAgentTask,
              agentTaskStatus: updatedSessionData.agentTaskStatus,
              lastUpdated: new Date().toISOString(),
              source: 'manual_agent_detection_update',
            },
          });

          updatedCount++;
        }
      } catch (error) {
        console.error(`Error processing session ${sessionEntry.id}:`, error.message);
      }
    }

    console.log(`\n✅ Update complete! Updated ${updatedCount} sessions.`);
    console.log('\n🧪 Now testing CLI detection...');
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateExistingSessions();
