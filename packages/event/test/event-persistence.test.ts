import test from 'ava';
import type { EventRecord, CursorPosition, EventStore, CursorStore } from '../dist/types.js';
import { InMemoryEventBus } from '../dist/memory.js';
import { Outbox } from '../dist/outbox.js';
import { MongoEventStore, MongoCursorStore } from '../dist/mongo.js';

// ============================================================================
// Test Fixtures and Helpers
// ============================================================================

type UUID = string;

const createMockEventStore = (): EventStore & { events: Map<string, EventRecord[]> } => {
  const events = new Map<string, EventRecord[]>();

  return {
    events,
    async insert<T>(e: EventRecord<T>): Promise<void> {
      if (!events.has(e.topic)) {
        events.set(e.topic, []);
      }
      events.get(e.topic)!.push(e);
    },
    async scan(
      topic: string,
      params: { afterId?: UUID; ts?: number; limit?: number },
    ): Promise<EventRecord[]> {
      const topicEvents = events.get(topic) || [];
      let filtered = [...topicEvents];

      if (params.afterId) {
        const idx = topicEvents.findIndex((e) => e.id === params.afterId);
        if (idx >= 0) {
          filtered = topicEvents.slice(idx + 1);
        }
      } else if (params.ts) {
        filtered = topicEvents.filter((e) => e.ts >= params.ts!);
      }

      filtered.sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));

      return filtered.slice(0, params.limit || 100);
    },
    async latestByKey(
      topic: string,
      keys: string[],
    ): Promise<Record<string, EventRecord | undefined>> {
      const topicEvents = events.get(topic) || [];
      const result: Record<string, EventRecord | undefined> = {};

      for (const key of keys) {
        const eventsWithKey = topicEvents
          .filter((e) => e.key === key)
          .sort((a, b) => b.ts - a.ts);
        if (eventsWithKey.length > 0) {
          result[key] = eventsWithKey[0];
        }
      }

      return result;
    },
  };
};

const createMockCursorStore = (): CursorStore & { cursors: Map<string, CursorPosition> } => {
  const cursors = new Map<string, CursorPosition>();

  return {
    cursors,
    async get(topic: string, group: string): Promise<CursorPosition | null> {
      return cursors.get(`${topic}:${group}`) || null;
    },
    async set(topic: string, group: string, cursor: CursorPosition): Promise<void> {
      cursors.set(`${topic}:${group}`, cursor);
    },
  };
};

// ============================================================================
// InMemoryEventBus Persistence Tests
// ============================================================================

test('InMemoryEventBus persists events to EventStore when provided', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  const payload = { userId: 'user-123', action: 'login' };
  const event = await eventBus.publish('user.activity', payload);

  t.true(store.events.has('user.activity'), 'Event should be stored');
  t.is(store.events.get('user.activity')?.length, 1, 'One event should be stored');
  t.deepEqual(store.events.get('user.activity')![0].payload, payload, 'Payload should match');
  t.is(event.topic, 'user.activity', 'Event topic should be set');
});

test('InMemoryEventBus persists events with metadata', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  const payload = { orderId: 'order-456' };
  const event = await eventBus.publish('order.created', payload, {
    key: 'order-456',
    headers: { 'x-source': 'checkout-service' },
    tags: ['e-commerce', 'checkout'],
    caused_by: ['event-prev-123'],
  });

  const stored = store.events.get('order.created')![0] as EventRecord<{ orderId: string }>;
  t.is(stored.key, 'order-456', 'Key should be persisted');
  t.deepEqual(stored.headers, { 'x-source': 'checkout-service' }, 'Headers should be persisted');
  t.deepEqual(stored.tags, ['e-commerce', 'checkout'], 'Tags should be persisted');
  t.deepEqual(stored.caused_by, ['event-prev-123'], 'Caused by should be persisted');
});

test('InMemoryEventBus persists multiple events in order', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  await eventBus.publish('sequence.test', { step: 1 });
  await eventBus.publish('sequence.test', { step: 2 });
  await eventBus.publish('sequence.test', { step: 3 });

  const stored = store.events.get('sequence.test')!;
  t.is(stored.length, 3, 'All events should be stored');
  t.is((stored[0].payload as { step: number }).step, 1, 'First event should be first');
  t.is((stored[1].payload as { step: number }).step, 2, 'Second event should be second');
  t.is((stored[2].payload as { step: number }).step, 3, 'Third event should be third');
});

test('InMemoryEventBus persists events across different topics', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  await eventBus.publish('users.created', { id: 'u1' });
  await eventBus.publish('orders.placed', { id: 'o1' });
  await eventBus.publish('users.created', { id: 'u2' });

  t.is(store.events.get('users.created')?.length, 2, 'Two user events');
  t.is(store.events.get('orders.placed')?.length, 1, 'One order event');
});

// ============================================================================
// Cursor Persistence Tests
// ============================================================================

test('InMemoryEventBus persists cursor position to CursorStore', async (t) => {
  const cursorStore = createMockCursorStore();
  const eventBus = new InMemoryEventBus(undefined, cursorStore);

  const cursor: CursorPosition = {
    topic: 'user.activity',
    lastId: 'event-789',
    lastTs: Date.now(),
  };

  await eventBus.setCursor('user.activity', 'processor-group', cursor);

  const retrieved = await eventBus.getCursor('user.activity', 'processor-group');
  t.deepEqual(retrieved, cursor, 'Cursor should be persisted and retrieved');
});

test('InMemoryEventBus returns null for missing cursor', async (t) => {
  const cursorStore = createMockCursorStore();
  const eventBus = new InMemoryEventBus(undefined, cursorStore);

  const cursor = await eventBus.getCursor('nonexistent.topic', 'unknown-group');
  t.is(cursor, null, 'Missing cursor should return null');
});

test('InMemoryEventBus updates cursor position', async (t) => {
  const cursorStore = createMockCursorStore();
  const eventBus = new InMemoryEventBus(undefined, cursorStore);

  await eventBus.setCursor('topic', 'group', {
    topic: 'topic',
    lastId: 'event-1',
    lastTs: 1000,
  });

  await eventBus.setCursor('topic', 'group', {
    topic: 'topic',
    lastId: 'event-2',
    lastTs: 2000,
  });

  const cursor = await eventBus.getCursor('topic', 'group');
  t.is(cursor?.lastId, 'event-2', 'Cursor should be updated');
  t.is(cursor?.lastTs, 2000, 'Cursor timestamp should be updated');
});

test('InMemoryEventBus maintains separate cursors per topic/group', async (t) => {
  const cursorStore = createMockCursorStore();
  const eventBus = new InMemoryEventBus(undefined, cursorStore);

  await eventBus.setCursor('topic-a', 'group-1', { topic: 'topic-a', lastId: 'e1' });
  await eventBus.setCursor('topic-a', 'group-2', { topic: 'topic-a', lastId: 'e2' });
  await eventBus.setCursor('topic-b', 'group-1', { topic: 'topic-b', lastId: 'e3' });

  t.is((await eventBus.getCursor('topic-a', 'group-1'))?.lastId, 'e1');
  t.is((await eventBus.getCursor('topic-a', 'group-2'))?.lastId, 'e2');
  t.is((await eventBus.getCursor('topic-b', 'group-1'))?.lastId, 'e3');
});

// ============================================================================
// Outbox Pattern Tests
// ============================================================================

test('Outbox stores pending events', (t) => {
  const outbox = new Outbox();
  const event: EventRecord = {
    id: 'event-123',
    ts: Date.now(),
    topic: 'outbox.test',
    payload: { data: 'test' },
  };

  outbox.add(event);

  t.is(outbox.size(), 1, 'Outbox should have one event');
  t.deepEqual(outbox.get('event-123'), event, 'Event should be retrievable by id');
});

test('Outbox removes events', (t) => {
  const outbox = new Outbox();
  const event: EventRecord = {
    id: 'event-123',
    ts: Date.now(),
    topic: 'outbox.test',
    payload: { data: 'test' },
  };

  outbox.add(event);
  const removed = outbox.remove('event-123');

  t.deepEqual(removed, event, 'Removed event should be returned');
  t.is(outbox.size(), 0, 'Outbox should be empty');
  t.is(outbox.get('event-123'), undefined, 'Event should no longer exist');
});

test('Outbox returns all pending events', (t) => {
  const outbox = new Outbox();
  const events: EventRecord[] = [
    { id: 'e1', ts: 100, topic: 't1', payload: {} },
    { id: 'e2', ts: 200, topic: 't1', payload: {} },
    { id: 'e3', ts: 300, topic: 't1', payload: {} },
  ];

  for (const e of events) {
    outbox.add(e);
  }

  const all = outbox.getAll();
  t.is(all.length, 3, 'Should return all events');
  t.true(all.some((e) => e.id === 'e1'));
  t.true(all.some((e) => e.id === 'e2'));
  t.true(all.some((e) => e.id === 'e3'));
});

test('Outbox clears all events', (t) => {
  const outbox = new Outbox();
  outbox.add({ id: 'e1', ts: 100, topic: 't1', payload: {} });
  outbox.add({ id: 'e2', ts: 200, topic: 't1', payload: {} });

  outbox.clear();

  t.is(outbox.size(), 0, 'Outbox should be empty after clear');
});

// ============================================================================
// MongoEventStore Tests (with mock collection)
// ============================================================================

test('MongoEventStore inserts events', async (t) => {
  const docs: any[] = [];
  const mockCollection = {
    insertOne: async (doc: any) => {
      docs.push(doc);
      return { acknowledged: true };
    },
  };

  const store = new MongoEventStore(mockCollection);
  const event: EventRecord = {
    id: 'mongo-event-1',
    ts: Date.now(),
    topic: 'mongo.test',
    payload: { item: 'test-item' },
  };

  await store.insert(event);

  t.is(docs.length, 1, 'Document should be inserted');
  t.deepEqual(docs[0], event, 'Event should be stored as-is');
});

test('MongoEventStore scans events by topic', async (t) => {
  const docs: EventRecord[] = [
    { id: 'e1', ts: 100, topic: 'scan.test', payload: { n: 1 } },
    { id: 'e2', ts: 200, topic: 'scan.test', payload: { n: 2 } },
    { id: 'e3', ts: 300, topic: 'scan.test', payload: { n: 3 } },
    { id: 'e4', ts: 400, topic: 'other.topic', payload: { n: 4 } },
  ];

  const mockCollection = {
    find: (query: any) => ({
      sort: () => ({
        limit: () => ({
          toArray: async () => docs.filter((d) => d.topic === query.topic),
        }),
      }),
    }),
  };

  const store = new MongoEventStore(mockCollection);
  const results = await store.scan('scan.test', {});

  t.is(results.length, 3, 'Should return events for topic');
  t.true(results.every((e) => e.topic === 'scan.test'));
});

test('MongoEventStore returns latest events by key', async (t) => {
  const docs: EventRecord[] = [
    { id: 'e1', ts: 100, topic: 'state.test', key: 'user-1', payload: { v: 1 } },
    { id: 'e2', ts: 200, topic: 'state.test', key: 'user-1', payload: { v: 2 } },
    { id: 'e3', ts: 300, topic: 'state.test', key: 'user-2', payload: { v: 1 } },
  ];

  const mockCollection = {
    find: () => ({
      sort: () => ({
        limit: () => ({
          toArray: async () => {
            // Return latest per key
            const byKey = new Map<string, EventRecord>();
            for (const d of docs) {
              if (d.key && (!byKey.has(d.key) || d.ts > (byKey.get(d.key)?.ts ?? 0))) {
                byKey.set(d.key, d);
              }
            }
            return Array.from(byKey.values());
          },
        }),
      }),
    }),
  };

  const store = new MongoEventStore(mockCollection);
  const latest = await store.latestByKey!('state.test', ['user-1', 'user-2']);

  t.is((latest['user-1']?.payload as { v: number })?.v, 2, 'Should return latest for user-1');
  t.is((latest['user-2']?.payload as { v: number })?.v, 1, 'Should return latest for user-2');
});

// ============================================================================
// MongoCursorStore Tests
// ============================================================================

test('MongoCursorStore gets and sets cursors', async (t) => {
  const docs: any[] = [];

  const mockCollection = {
    findOne: async (query: any) => {
      return docs.find((d) => d.topic === query.topic && d.group === query.group) || null;
    },
    updateOne: async (query: any, update: any, _opts: any) => {
      const existing = docs.findIndex((d) => d.topic === query.topic && d.group === query.group);
      if (existing >= 0) {
        docs[existing] = { ...query, ...update.$set };
      } else {
        docs.push({ ...query, ...update.$set });
      }
      return { matchedCount: 1, modifiedCount: 1 };
    },
  };

  const store = new MongoCursorStore(mockCollection);

  const cursor: CursorPosition = {
    topic: 'cursor.test',
    lastId: 'last-event-id',
    lastTs: Date.now(),
  };

  await store.set('cursor.test', 'group-1', cursor);
  const retrieved = await store.get('cursor.test', 'group-1');

  // MongoCursorStore may include group in the stored document, so check relevant fields
  t.is(retrieved?.topic, cursor.topic, 'Topic should match');
  t.is(retrieved?.lastId, cursor.lastId, 'lastId should match');
  t.is(retrieved?.lastTs, cursor.lastTs, 'lastTs should match');
});

test('MongoCursorStore returns null for missing cursor', async (t) => {
  const mockCollection = {
    findOne: async () => null,
  };

  const store = new MongoCursorStore(mockCollection);
  const cursor = await store.get('missing.topic', 'unknown-group');

  t.is(cursor, null, 'Should return null for missing cursor');
});

// ============================================================================
// Integration Test: Full Event Persistence Flow
// ============================================================================

test('Full event persistence flow with store and cursor', async (t) => {
  const eventStore = createMockEventStore();
  const cursorStore = createMockCursorStore();
  const eventBus = new InMemoryEventBus(eventStore, cursorStore);

  // Subscribe to events
  const received: EventRecord[] = [];
  await eventBus.subscribe(
    'integration.test',
    'test-processor',
    async (event) => {
      received.push(event);
    },
    { from: 'earliest' },
  );

  // Publish events
  const event1 = await eventBus.publish('integration.test', { step: 1 });
  const event2 = await eventBus.publish('integration.test', { step: 2 });
  const event3 = await eventBus.publish('integration.test', { step: 3 });

  // Verify storage
  const storedEvents = eventStore.events.get('integration.test')!;
  t.is(storedEvents.length, 3, 'All events should be persisted');

  // Update cursor after processing
  await eventBus.setCursor('integration.test', 'test-processor', {
    topic: 'integration.test',
    lastId: event3.id,
    lastTs: event3.ts,
  });

  // Verify cursor
  const cursor = await eventBus.getCursor('integration.test', 'test-processor');
  t.is(cursor?.lastId, event3.id, 'Cursor should point to last event');
});

// ============================================================================
// Event Metadata and Ordering Tests
// ============================================================================

test('Events maintain insertion order with timestamps', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  const baseTs = Date.now();
  const event1 = await eventBus.publish('order.test', { n: 1 }, { ts: baseTs });
  const event2 = await eventBus.publish('order.test', { n: 2 }, { ts: baseTs + 100 });
  const event3 = await eventBus.publish('order.test', { n: 3 }, { ts: baseTs + 200 });

  const stored = store.events.get('order.test')!;
  t.true(stored[0].ts < stored[1].ts, 'Events should be in timestamp order');
  t.true(stored[1].ts < stored[2].ts, 'Events should be in timestamp order');
});

test('Events can be filtered during subscription', async (t) => {
  const eventBus = new InMemoryEventBus();
  const received: EventRecord[] = [];

  await eventBus.subscribe(
    'filter.test',
    'filter-group',
    async (event) => {
      received.push(event);
    },
    {
      filter: (e) => (e.payload as any).priority === 'high',
    },
  );

  await eventBus.publish('filter.test', { priority: 'low' });
  await eventBus.publish('filter.test', { priority: 'high' });
  await eventBus.publish('filter.test', { priority: 'low' });
  await eventBus.publish('filter.test', { priority: 'high' });

  t.is(received.length, 2, 'Only high priority events should be received');
  t.true(received.every((e) => (e.payload as any).priority === 'high'));
});

test('Events include session ID for traceability', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  const sessionId = 'session-abc-123';
  const event = await eventBus.publish('session.test', { data: 'test' }, { sid: sessionId });

  t.is(event.sid, sessionId, 'Session ID should be stored');
  t.is(store.events.get('session.test')![0].sid, sessionId, 'Session ID should be persisted');
});

// ============================================================================
// Edge Cases and Error Handling Tests
// ============================================================================

test('EventBus handles concurrent publishes correctly', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  // Publish 100 events concurrently
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(eventBus.publish('concurrent.test', { index: i }));
  }

  await Promise.all(promises);

  const stored = store.events.get('concurrent.test')!;
  t.is(stored.length, 100, 'All events should be stored');
});

test('EventBus generates unique IDs for events', async (t) => {
  const eventBus = new InMemoryEventBus();

  const events = await Promise.all([
    eventBus.publish('unique.test', { n: 1 }),
    eventBus.publish('unique.test', { n: 2 }),
    eventBus.publish('unique.test', { n: 3 }),
  ]);

  const ids = events.map((e) => e.id);
  const uniqueIds = new Set(ids);
  t.is(uniqueIds.size, 3, 'All event IDs should be unique');
});

test('EventBus with no store still delivers to subscribers', async (t) => {
  const eventBus = new InMemoryEventBus(); // No store
  const received: EventRecord[] = [];

  await eventBus.subscribe('nostore.test', 'test-group', async (event) => {
    received.push(event);
  });

  await eventBus.publish('nostore.test', { data: 'test' });

  // Wait a bit for async delivery
  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(received.length, 1, 'Event should be delivered to subscriber');
});

test('Outbox handles duplicate IDs by overwriting', (t) => {
  const outbox = new Outbox();

  const event1: EventRecord = {
    id: 'same-id',
    ts: 100,
    topic: 'test',
    payload: { version: 1 },
  };

  const event2: EventRecord = {
    id: 'same-id',
    ts: 200,
    topic: 'test',
    payload: { version: 2 },
  };

  outbox.add(event1);
  outbox.add(event2);

  t.is(outbox.size(), 1, 'Should have only one event (overwritten)');
  t.deepEqual(outbox.get('same-id')?.payload, { version: 2 }, 'Should have latest version');
});

test('EventBus ack and nack return appropriate responses', async (t) => {
  const eventBus = new InMemoryEventBus();

  const ackResult = await eventBus.ack('test.topic', 'test-group', 'event-123');
  t.true(ackResult.ok, 'Ack should return ok: true');

  const nackResult = await eventBus.nack('test.topic', 'test-group', 'event-123', 'test reason');
  t.false(nackResult.ok, 'Nack should return ok: false');
  t.is(nackResult.err, 'test reason', 'Nack should include reason');
});

test('EventRecord with optional fields handles undefined gracefully', async (t) => {
  const store = createMockEventStore();
  const eventBus = new InMemoryEventBus(store);

  const event = await eventBus.publish('minimal.test', { data: 'test' });

  t.is(event.key, undefined, 'Key should be undefined when not provided');
  t.is(event.headers, undefined, 'Headers should be undefined when not provided');
  t.is(event.tags, undefined, 'Tags should be undefined when not provided');
  t.is(event.caused_by, undefined, 'Caused by should be undefined when not provided');
  t.is(event.sid, undefined, 'Session ID should be undefined when not provided');
});
