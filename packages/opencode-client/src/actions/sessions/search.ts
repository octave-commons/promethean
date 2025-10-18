import { SessionUtils, agentTasks } from '../../index.js';

export async function search({
  query,
  k,
  sessionId,
  client,
}: {
  query: string;
  k?: number;
  sessionId?: string;
  client: any;
}) {
  try {
    const { data: sessions, error } = await client.session.search({ query, k, sessionId });
    if (error) return `Failed to search sessions: ${error}`;
    if (!sessions?.length) return 'No sessions found';

    const enhanced = await Promise.all(
      sessions.map(async (session: any) => {
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
