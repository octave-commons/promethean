import { SessionUtils, agentTasks, sessionStore } from '../../index.js';

export async function list({ limit, offset }: { limit: number; offset: number }) {
  try {
    // Get sessions from dual store - fail fast if not available
    const storedSessions = await sessionStore.getMostRecent(1000); // Get a large number
    if (!storedSessions?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    const sessionsList = storedSessions.map((session) => JSON.parse(session.text));

    if (!sessionsList?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    const sortedSessions = [...sessionsList].sort((a: any, b: any) => {
      const aId = a.id || '';
      const bId = b.id || '';
      return bId.localeCompare(aId);
    });
    const paginated = sortedSessions.slice(offset, offset + limit);

    const enhanced = await Promise.all(
      paginated.map(async (session: any) => {
        try {
          // Get messages from dual store - fail fast if not available
          const messageKey = `session:${session.id}:messages`;
          const allStored = await sessionStore.getMostRecent(1000);
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
    return `Failed to list sessions: ${error.message}`;
  }
}
