export async function subscribe({
  eventType,
  sessionId,
  client,
}: {
  eventType?: string;
  sessionId?: string;
  client: any;
}) {
  try {
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
  } catch (error: any) {
    console.error('Error subscribing to events:', error);
    return `Failed to subscribe to events: ${error.message}`;
  }
}
