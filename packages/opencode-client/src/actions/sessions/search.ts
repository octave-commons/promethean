import { SessionUtils, agentTasks, sessionStore } from '../../index.js';

export async function search({
  query,
  k,
  sessionId,
}: {
  query: string;
  k?: number;
  sessionId?: string;
}) {
  try {
    // Search sessions from dual store - fail fast if not available
    const storedSessions = await sessionStore.getMostRecent(1000); // Get a large number
    if (!storedSessions?.length) {
      return JSON.stringify({
        query,
        results: [],
        totalCount: 0,
      });
    }

    const sessionEntries = storedSessions
      .filter(
        (entry) => entry.id && entry.id.startsWith('session:') && !entry.id.includes(':messages'),
      )
      .map((entry) => JSON.parse(entry.text));

    // Simple text-based search filtering
    let filteredSessions = sessionEntries;
    if (query) {
      const queryLower = query.toLowerCase();
      filteredSessions = sessionEntries.filter((session: any) => {
        // Search in session title, description, and other text fields
        return (
          session.title?.toLowerCase().includes(queryLower) ||
          session.description?.toLowerCase().includes(queryLower) ||
          session.id?.toLowerCase().includes(queryLower) ||
          session.agent?.toLowerCase().includes(queryLower)
        );
      });
    }

    if (sessionId) {
      filteredSessions = filteredSessions.filter((session: any) => session.id === sessionId);
    }

    // Apply limit k if specified
    const sessions = k ? filteredSessions.slice(0, k) : filteredSessions;

    const enhanced = await Promise.all(
      sessions.map(async (session: any) => {
        try {
          // Get messages from dual store - fail fast if not available
          const messageKey = `session:${session.id}:messages`;
          const messageEntry = await sessionStore.get(messageKey);
          let messages: any[] = [];
          if (messageEntry) {
            messages = JSON.parse(messageEntry.text);
          }

          const agentTask = agentTasks.get(session.id);
          return SessionUtils.createSessionInfo(session, messages.length, agentTask);
        } catch (error: any) {
          console.error(`Error processing session ${session.id}:`, error);
          const agentTask = agentTasks.get(session.id);
          return {
            ...SessionUtils.createSessionInfo(session, 0, agentTask),
            error: 'Could not fetch messages',
          };
        }
      }),
    );

    return JSON.stringify({
      query,
      results: enhanced,
      totalCount: enhanced.length,
    });
  } catch (error: any) {
    console.error('Error searching sessions:', error);
    return `Failed to search sessions: ${error.message}`;
  }
}
