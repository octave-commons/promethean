export async function list({
  query,
  k,
  eventType,
  sessionId,
  hasTool,
  isAgentTask,
  client,
}: {
  query?: string;
  k?: number;
  eventType?: string;
  sessionId?: string;
  hasTool?: boolean;
  isAgentTask?: boolean;
  client: any;
}) {
  try {
    const { data: events, error } = await client.events.list({
      query,
      k,
      eventType,
      sessionId,
      hasTool,
      isAgentTask,
    });

    if (error) return `Failed to fetch events: ${error}`;
    if (!events?.length) return 'No events found';

    return JSON.stringify({
      events,
      totalCount: events.length,
      filters: { query, k, eventType, sessionId, hasTool, isAgentTask },
    });
  } catch (error: any) {
    console.error('Error listing events:', error);
    return `Failed to list events: ${error.message}`;
  }
}
