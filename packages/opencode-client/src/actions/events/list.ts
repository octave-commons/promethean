import { sessionStore } from '../../index.js';
import type { StoredEvent, EventEntry, EventListOptions } from '../../types/index.js';

export async function list({
  query,
  k,
  eventType,
  sessionId,
  hasTool,
  isAgentTask,
}: EventListOptions) {
  try {
    // Try to get events from dual store first
    let events: StoredEvent[] = [];

    try {
      // Get all entries from dual store and filter for events
      const storedEntries = await sessionStore.getMostRecent(1000); // Get a large number
      const eventEntries = storedEntries
        .filter((entry: EventEntry) => entry.id && entry.id.startsWith('event:'))
        .map(
          (entry: EventEntry) =>
            ({
              ...JSON.parse(entry.text),
              _id: entry.id,
              _timestamp: entry.timestamp,
            }) as StoredEvent,
        );

      // Apply filters
      let filteredEvents = eventEntries;

      if (query) {
        const queryLower = query.toLowerCase();
        filteredEvents = filteredEvents.filter((event: StoredEvent) => {
          return (
            event.type?.toLowerCase().includes(queryLower) ||
            event.sessionId?.toLowerCase().includes(queryLower) ||
            event.content?.toLowerCase().includes(queryLower) ||
            event.description?.toLowerCase().includes(queryLower)
          );
        });
      }

      if (eventType) {
        filteredEvents = filteredEvents.filter((event: StoredEvent) => event.type === eventType);
      }

      if (sessionId) {
        filteredEvents = filteredEvents.filter(
          (event: StoredEvent) => event.sessionId === sessionId,
        );
      }

      if (hasTool !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event: StoredEvent) => (event.hasTool === true) === hasTool,
        );
      }

      if (isAgentTask !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event: StoredEvent) => (event.isAgentTask === true) === isAgentTask,
        );
      }

      // Sort by timestamp (newest first) and apply limit
      filteredEvents.sort(
        (a: StoredEvent, b: StoredEvent) =>
          new Date(b._timestamp || 0).getTime() - new Date(a._timestamp || 0).getTime(),
      );
      events = k ? filteredEvents.slice(0, k) : filteredEvents;
    } catch (storeError: unknown) {
      console.warn('Failed to get events from dual store:', storeError);
    }

    // No fallback to client since event.list() is not available in OpencodeClient API
    // If no events found in dual store, return empty result

    return JSON.stringify({
      events,
      totalCount: events.length,
      filters: { query, k, eventType, sessionId, hasTool, isAgentTask },
    });
  } catch (error: unknown) {
    console.error('Error listing events:', error);
    return `Failed to list events: ${error instanceof Error ? error.message : String(error)}`;
  }
}
