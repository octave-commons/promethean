// In-memory EventBus implementation that conforms to ./types
import type {
  EventBus,
  EventRecord,
  PublishOptions,
  SubscribeOptions,
  Handler,
  CursorPosition,
  EventStore,
  CursorStore,
  Ack,
  DeliveryContext,
  UUID,
} from './types.js';
import { v7 as uuidv7 } from 'uuid';

// Simple in-memory storage
const events = new Map<string, EventRecord[]>();
const cursors = new Map<string, CursorPosition>();
const subscriptions = new Map<string, Array<{ handler: Handler; opts: SubscribeOptions }>>();

function getSubscriptionKey(topic: string, group: string): string {
  return `${topic}:${group}`;
}

function getCursorKey(topic: string, group: string): string {
  return `${topic}:${group}`;
}

export class InMemoryEventBus implements EventBus {
  constructor(
    private store?: EventStore,
    private cursorStore?: CursorStore,
  ) {}

  async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
    const event: EventRecord<T> = {
      id: opts.id || uuidv7(),
      ts: opts.ts || Date.now(),
      topic,
      payload,
      key: opts.key,
      headers: opts.headers,
      tags: opts.tags,
      caused_by: opts.caused_by,
      sid: opts.sid,
    };

    // Store event
    if (!events.has(topic)) {
      events.set(topic, []);
    }
    events.get(topic)!.push(event);

    // Persist to store if provided
    if (this.store) {
      await this.store.insert(event);
    }

    // Notify subscribers
    const topicSubscriptions = Array.from(subscriptions.entries())
      .filter(([key]) => key.startsWith(`${topic}:`))
      .flatMap(([_, subs]) => subs);

    for (const sub of topicSubscriptions) {
      if (sub.opts.filter && !sub.opts.filter(event)) {
        continue;
      }

      const ctx: DeliveryContext = {
        attempt: 1,
        maxAttempts: sub.opts.maxAttempts || 5,
      };

      // Fire and forget for in-memory implementation
      sub.handler(event, ctx).catch((err) => {
        console.error('Event handler error:', err);
      });
    }

    return event;
  }

  async subscribe(
    topic: string,
    group: string,
    handler: Handler,
    opts: Omit<SubscribeOptions, 'group'> = {},
  ): Promise<() => Promise<void>> {
    const key = getSubscriptionKey(topic, group);

    if (!subscriptions.has(key)) {
      subscriptions.set(key, []);
    }

    const subscription = { handler, opts: { ...opts, group } as SubscribeOptions };
    subscriptions.get(key)!.push(subscription);

    // Return unsubscribe function
    return async () => {
      const subs = subscriptions.get(key);
      if (subs) {
        const index = subs.indexOf(subscription);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  async ack(_topic: string, _group: string, id: UUID): Promise<Ack> {
    // In-memory implementation doesn't need explicit acking
    return { id, ok: true };
  }

  async nack(_topic: string, _group: string, id: UUID, reason?: string): Promise<Ack> {
    // In-memory implementation doesn't need explicit nacking
    return { id, ok: false, err: reason };
  }

  async getCursor(topic: string, group: string): Promise<CursorPosition | null> {
    const key = getCursorKey(topic, group);

    if (this.cursorStore) {
      return await this.cursorStore.get(topic, group);
    }

    return cursors.get(key) || null;
  }

  async setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void> {
    const key = getCursorKey(topic, group);

    if (this.cursorStore) {
      await this.cursorStore.set(topic, group, cursor);
    }

    cursors.set(key, cursor);
  }
}
