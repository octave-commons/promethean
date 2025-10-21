import { eventStore } from '../../index.js';
import type { StoredEvent, EventEntry, EventListOptions } from '../../types/index.js';

const getStoredEvents = async (): Promise<StoredEvent[]> => {
  const storedEntries = await eventStore.getMostRecent(1000);
  return storedEntries
    .filter((entry: EventEntry) => entry.id && entry.id.startsWith('event:'))
    .map(
      (entry: EventEntry) =>
        ({
          ...JSON.parse(entry.text),
          _id: entry.id,
          _timestamp: entry.timestamp,
        }) as StoredEvent,
    );
};

const applyFilters = (
  events: StoredEvent[],
  { query, eventType, sessionId, hasTool, isAgentTask }: EventListOptions,
): StoredEvent[] => {
  let filteredEvents = events;

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
    filteredEvents = filteredEvents.filter((event: StoredEvent) => event.sessionId === sessionId);
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

  return filteredEvents;
};

const sortAndLimitEvents = (events: StoredEvent[], k?: number): StoredEvent[] => {
  const sortedEvents = events.sort(
    (a: StoredEvent, b: StoredEvent) =>
      new Date(b._timestamp || 0).getTime() - new Date(a._timestamp || 0).getTime(),
  );
  return k ? sortedEvents.slice(0, k) : sortedEvents;
};

export async function list(options: EventListOptions): Promise<StoredEvent[]> {
  const result = await getStoredEvents().catch((error: unknown) => {
    console.warn('Failed to get events from dual store:', error);
    return [] as StoredEvent[];
  });

  const filteredEvents = applyFilters(result, options);
  return sortAndLimitEvents(filteredEvents, options.k);
}
