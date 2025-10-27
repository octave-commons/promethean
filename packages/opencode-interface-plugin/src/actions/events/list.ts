// SPDX-License-Identifier: GPL-3.0-only

import { getEventStore } from '../../stores.js';

export async function list({
  query,
  k,
  eventType,
  sessionId,
}: {
  query?: string;
  k?: number;
  eventType?: string;
  sessionId?: string;
}): Promise<any[]> {
  try {
    const store = await getEventStore();
    const events = await store.getMostRecent(k || 100);

    if (!events?.length) {
      return [];
    }

    // Filter events based on criteria
    let filteredEvents = events;

    if (eventType) {
      filteredEvents = filteredEvents.filter((event: any) => {
        const eventData = JSON.parse(event.text);
        return eventData.type === eventType;
      });
    }

    if (sessionId) {
      filteredEvents = filteredEvents.filter((event: any) => {
        const eventData = JSON.parse(event.text);
        return eventData.sessionId === sessionId;
      });
    }

    if (query) {
      const queryLower = query.toLowerCase();
      filteredEvents = filteredEvents.filter((event: any) => {
        const eventData = JSON.parse(event.text);
        const textContent = JSON.stringify(eventData).toLowerCase();
        return textContent.includes(queryLower);
      });
    }

    // Parse and return events
    return filteredEvents.map((event: any) => JSON.parse(event.text));
  } catch (error: unknown) {
    console.error('Error listing events:', error);
    return [];
  }
}
