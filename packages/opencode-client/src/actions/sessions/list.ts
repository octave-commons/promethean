import { SessionUtils, agentTasks } from '../../index.js';

export async function list({
  limit,
  offset,
  client,
}: {
  limit: number;
  offset: number;
  client: any;
}) {
  try {
    const { data: sessionsList, error } = await client.session.list();
    if (error) return `Failed to fetch sessions: ${error}`;
    if (!sessionsList?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    const sortedSessions = [...sessionsList].sort((a: any, b: any) => b.id.localeCompare(a.id));
    const paginated = sortedSessions.slice(offset, offset + limit);

    const enhanced = await Promise.all(
      paginated.map(async (session: any) => {
        try {
          const messages = await SessionUtils.getSessionMessages(client, session.id);
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
