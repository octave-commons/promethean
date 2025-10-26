import type { EventClient } from '../../types/index.js';

export type SubscribeResult = {
  readonly success: boolean;
  readonly subscription?: string;
  readonly eventType?: string;
  readonly sessionId?: string;
  readonly note?: string;
  readonly error?: string;
};

export async function subscribe({
  eventType,
  sessionId,
  client,
}: {
  readonly eventType?: string;
  readonly sessionId?: string;
  readonly client: EventClient;
}): Promise<SubscribeResult> {
  if (!client.event?.subscribe) {
    return {
      success: false,
      error: 'Events subscription not supported by this client',
    };
  }

  try {
    // Note: The async generator returned by client.event.subscribe()
    // should be handled by the caller, not the action
    await client.event.subscribe();

    return {
      success: true,
      subscription: 'Event subscription established',
      eventType,
      sessionId,
      note: 'Use the returned async generator to listen for events',
    };
  } catch (error: unknown) {
    console.error('Error subscribing to events:', error);
    return {
      success: false,
      error: `Failed to subscribe to events: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
