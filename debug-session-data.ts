import { sessionStore } from './packages/opencode-client/src/index.js';

async function debugSessionData() {
  try {
    // Get recent sessions
    const sessions = await sessionStore.getMostRecent(10);
    console.log(`Found ${sessions.length} sessions:\n`);

    for (const session of sessions) {
      try {
        const parsed = JSON.parse(session.text);
        console.log(`Session ID: ${parsed.id}`);
        console.log(`Title: ${parsed.title}`);
        console.log(`isAgentTask: ${parsed.isAgentTask}`);
        console.log(`agentTaskStatus: ${parsed.agentTaskStatus}`);
        console.log(`---`);
      } catch (e) {
        console.log(`Failed to parse session ${session.id}:`, e.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debugSessionData().catch(console.error);
