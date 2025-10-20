import { SessionUtils, agentTasks, sessionStore } from '../../index.js';

// Define Session type locally since API was removed
interface Session {
  id: string;
  title: string;
  createdAt: string;
}

/**
 * Safely parse session data, handling both JSON and plain text formats
 */
function parseSessionData(session: {
  text: string;
  id?: string;
  timestamp?: Date | number | string;
}): Session {
  try {
    return JSON.parse(session.text);
  } catch (error) {
    // Handle legacy plain text format - extract session ID from text
    const text = session.text;
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    if (sessionMatch) {
      return {
        id: sessionMatch[1] || 'unknown',
        title: `Session ${sessionMatch[1]}`,
        createdAt: session.timestamp
          ? typeof session.timestamp === 'number'
            ? new Date(session.timestamp).toISOString()
            : session.timestamp instanceof Date
              ? session.timestamp.toISOString()
              : session.timestamp
          : new Date().toISOString(),
      };
    }
    // Fallback - create minimal session object
    return {
      id: session.id || 'unknown',
      title: 'Legacy Session',
      createdAt: session.timestamp
        ? typeof session.timestamp === 'number'
          ? new Date(session.timestamp).toISOString()
          : session.timestamp instanceof Date
            ? session.timestamp.toISOString()
            : session.timestamp
        : new Date().toISOString(),
    };
  }
}

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
    const sessionEntry = await sessionStore.get(sessionId);
    if (!sessionEntry) {
      return 'Session not found in dual store';
    }

    const session = parseSessionData(sessionEntry);

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

    let messages;
    try {
      messages = JSON.parse(messageEntry.text);
    } catch (error) {
      messages = [];
    }

    const agentTask = agentTasks.get(sessionId);
    const sessionInfo = SessionUtils.createSessionInfo(session, messages.length, agentTask);

    return JSON.stringify({
      session: sessionInfo,
      messages: limit ? messages.slice(offset || 0, (offset || 0) + limit) : messages,
    });
  } catch (error: unknown) {
    console.error('Error getting session:', error);
    return `Failed to get session: ${error instanceof Error ? error.message : String(error)}`;
  }
}
