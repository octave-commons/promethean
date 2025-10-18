import { SessionUtils, agentTasks, sessionStore } from '../../index.js';

export async function get({
  sessionId,
  limit,
  offset,
}: {
  sessionId: string;
  limit?: number;
  offset?: number;
}) {
  try {
    // Get session from dual store - fail fast if not available
    const sessionEntry = await sessionStore.get(`session:${sessionId}`);
    if (!sessionEntry) {
      return 'Session not found in dual store';
    }

    const session = JSON.parse(sessionEntry.text);

    // Get messages from dual store - fail fast if not available
    const messageKey = `session:${sessionId}:messages`;
    const messageEntry = await sessionStore.get(messageKey);
    if (!messageEntry) {
      // Return session with empty messages array - no fallback
      const agentTask = agentTasks.get(sessionId);
      const sessionInfo = SessionUtils.createSessionInfo(session, 0, agentTask);

      return JSON.stringify({
        session: sessionInfo,
        messages: [],
      });
    }

    const messages = JSON.parse(messageEntry.text);

    const agentTask = agentTasks.get(sessionId);
    const sessionInfo = SessionUtils.createSessionInfo(session, messages.length, agentTask);

    return JSON.stringify({
      session: sessionInfo,
      messages: limit ? messages.slice(offset || 0, (offset || 0) + limit) : messages,
    });
  } catch (error: any) {
    console.error('Error getting session:', error);
    return `Failed to get session: ${error.message}`;
  }
}
