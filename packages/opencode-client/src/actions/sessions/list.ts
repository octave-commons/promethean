import { SessionUtils, agentTasks, sessionStore } from '../../index.js';
import { deduplicateSessions } from '../../utils/session-cleanup.js';

/**
 * Safely parse session data, handling both JSON and plain text formats
 */
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

export async function list({ limit, offset }: { limit: number; offset: number }) {
  let storedSessions: any[] = [];
  try {
    console.log(`[DEBUG] list called with limit=${limit}, offset=${offset}`);

    // Get sessions from dual store - use limit + offset as buffer to ensure we have enough items
    // Add a reasonable buffer to account for potential filtering, but don't fetch all 1000
    const fetchLimit = Math.min(limit + offset + 50, 500); // Reasonable upper bound
    console.log(`[DEBUG] fetchLimit=${fetchLimit}`);
    storedSessions = await sessionStore.getMostRecent(fetchLimit);
    console.log(`[DEBUG] retrieved ${storedSessions?.length || 0} sessions from store`);

    if (!storedSessions?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    // Parse sessions and deduplicate by ID
    const parsedSessions = storedSessions.map((session) => parseSessionData(session));
    const sessionsList = deduplicateSessions(parsedSessions);
    console.log(`[DEBUG] after deduplication: ${sessionsList?.length || 0} sessions`);

    if (!sessionsList?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    const sortedSessions = [...sessionsList].sort((a: any, b: any) => {
      // Sort by creation time (most recent first), fallback to ID
      const aTime = a.createdAt || a.time?.created || a.timestamp || '';
      const bTime = b.createdAt || b.time?.created || b.timestamp || '';

      // Ensure timestamps are strings before comparing
      if (aTime && bTime && typeof aTime === 'string' && typeof bTime === 'string') {
        return bTime.localeCompare(aTime);
      }

      // Fallback to ID comparison if no valid timestamps
      const aId = a.id || '';
      const bId = b.id || '';
      return bId.localeCompare(aId);
    });
    const paginated = sortedSessions.slice(offset, offset + limit);
    console.log(
      `[DEBUG] after pagination: ${paginated.length} sessions (offset=${offset}, limit=${limit})`,
    );

    const enhanced = await Promise.all(
      paginated.map(async (session: any) => {
        try {
          // Get messages from dual store - fail fast if not available
          const messageKey = `session:${session.id}:messages`;
          // Only fetch recent messages, not all 1000
          const allStored = await sessionStore.getMostRecent(100); // Reduced from 1000
          const messageEntry = allStored.find((entry) => entry.id === messageKey);
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

    const totalCount = sessionsList.length;
    const hasMore = offset + limit < totalCount;

    return JSON.stringify(
      {
        sessions: enhanced,
        totalCount,
        pagination: {
          limit,
          offset,
          hasMore,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          active: enhanced.filter((s: any) => s.activityStatus === 'active').length,
          waiting_for_input: enhanced.filter((s: any) => s.activityStatus === 'waiting_for_input')
            .length,
          idle: enhanced.filter((s: any) => s.activityStatus === 'idle').length,
          agentTasks: enhanced.filter((s: any) => s.isAgentTask).length,
        },
      },
      null,
      2,
    );
  } catch (error: any) {
    console.error('Error in list_sessions:', error);
    console.error('Parameters received:', { limit, offset });
    console.error('Stored sessions count:', storedSessions?.length || 0);
    return `Failed to list sessions: ${error.message}`;
  }
}
