import { sessionStore } from '../../index.js';

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
    // Try to get events from dual store first
    let events: any[] = [];
    let fetchError: string | null = null;

    try {
      // Get all entries from dual store and filter for events
      const storedEntries = await sessionStore.getMostRecent(1000); // Get a large number
      const eventEntries = storedEntries
        .filter((entry) => entry.id && entry.id.startsWith('event:'))
        .map((entry) => ({
          ...JSON.parse(entry.text),
          _id: entry.id,
          _timestamp: entry.timestamp,
        }));

      // Apply filters
      let filteredEvents = eventEntries;

      if (query) {
        const queryLower = query.toLowerCase();
        filteredEvents = filteredEvents.filter((event: any) => {
          return (
            event.type?.toLowerCase().includes(queryLower) ||
            event.sessionId?.toLowerCase().includes(queryLower) ||
            event.content?.toLowerCase().includes(queryLower) ||
            event.description?.toLowerCase().includes(queryLower)
          );
        });
      }

      if (eventType) {
        filteredEvents = filteredEvents.filter((event: any) => event.type === eventType);
      }

      if (sessionId) {
        filteredEvents = filteredEvents.filter((event: any) => event.sessionId === sessionId);
      }

      if (hasTool !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event: any) => (event.hasTool === true) === hasTool,
        );
      }

      if (isAgentTask !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event: any) => (event.isAgentTask === true) === isAgentTask,
        );
      }

      // Sort by timestamp (newest first) and apply limit
      filteredEvents.sort(
        (a: any, b: any) => new Date(b._timestamp).getTime() - new Date(a._timestamp).getTime(),
      );
      events = k ? filteredEvents.slice(0, k) : filteredEvents;
    } catch (storeError) {
      console.warn('Failed to get events from dual store, falling back to client:', storeError);
      fetchError = `Dual store error: ${(storeError as Error).message}`;
    }

    // Fallback to client if no events found in dual store and client is available
    if (events.length === 0 && client) {
      const { data: clientEvents, error } = await client.events.list({
        query,
        k,
        eventType,
        sessionId,
        hasTool,
        isAgentTask,
      });

      if (error) {
        const errorMsg = fetchError
          ? `${fetchError}, Client error: ${error}`
          : `Failed to fetch events: ${error}`;
        return errorMsg;
      }
      if (!clientEvents?.length) return 'No events found';
      events = clientEvents;
    }

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
