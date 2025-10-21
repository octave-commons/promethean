import type { EventClient } from '../../types/index.js';

export async function subscribe({
  eventType,
  sessionId,
  client,
}: {
  readonly eventType?: string;
  readonly sessionId?: string;
  readonly client: EventClient;
}): Promise<string> {
  if (!client.event?.subscribe) {
    return 'Events subscription not supported by this client';
  }

  const result = await client.event.subscribe().catch((error: unknown) => {
    console.error('Error subscribing to events:', error);
    return null;
  });

  if (!result) {
    return 'Failed to subscribe to events';
  }

  // actions should just handle processing the data
  // encoding should be handled by the server/client transport layer
  return JSON.stringify({
    success: true,
    subscription: 'Event subscription established',
    eventType,
    sessionId,
    note: 'Use the returned SSE stream to listen for events',
  });
}
