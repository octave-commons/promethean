import { SessionUtils, agentTasks } from '../../index.js';

export async function get({
  sessionId,
  limit,
  offset,
  client,
}: {
  sessionId: string;
  limit?: number;
  offset?: number;
  client: any;
}) {
  try {
    const { data: session, error } = await client.session.get(sessionId);
    if (error) return `Failed to fetch session: ${error}`;
    if (!session) return 'Session not found';

    const messages = await SessionUtils.getSessionMessages(client, sessionId);
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
