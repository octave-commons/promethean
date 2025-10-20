import type { EventClient } from '../../types/index.js';

export async function subscribe({
  eventType,
  sessionId,
  client,
}: {
  eventType?: string;
  sessionId?: string;
  client: EventClient;
}) {
  try {
    if (!client.events?.subscribe) {
      return 'Events subscription not supported by this client';
    }
    const { data: subscription, error } = await client.events.subscribe({
      eventType,
      sessionId,
    });

    if (error) return `Failed to subscribe to events: ${error}`;
    if (!subscription) return 'No subscription created';

    return JSON.stringify({
      success: true,
      subscription: {
        id: subscription.id,
        eventType: subscription.eventType,
        sessionId: subscription.sessionId,
        status: 'active',
      },
    });
  } catch (error: unknown) {
    console.error('Error subscribing to events:', error);
    return `Failed to subscribe to events: ${error instanceof Error ? error.message : String(error)}`;
  }
}
