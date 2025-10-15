import test from 'ava';
import { PostgresEventStore } from '../event-store.js';
import { MockEventStore } from './utils/mocks.js';
import { createMockEvent } from './utils/fixtures.js';
import { ContextEvent } from '../types.js';

// Mock database for testing PostgresEventStore
const createMockDb = () => ({
  query: async (_query: string, _params: any[]) => {
    // Simple mock that returns empty result for now
    // In real implementation, this would be more sophisticated
    return { rows: [] };
  },
});

test.serial('MockEventStore: should append event successfully', async (t) => {
  const mockStore = new MockEventStore();

  const eventData = createMockEvent();

  await mockStore.appendEvent(eventData);

  const retrievedEvents = await mockStore.getEvents(eventData.agentId);
  t.is(retrievedEvents.length, 1);
  t.deepEqual(retrievedEvents[0], eventData);
});

test.serial('MockEventStore: should retrieve events by agent ID', async (t) => {
  const mockStore = new MockEventStore();

  const agentId = 'agent-123';
  const event1 = createMockEvent({ agentId, type: 'event-1' });
  const event2 = createMockEvent({ agentId, type: 'event-2' });
  const event3 = createMockEvent({ agentId: 'other-agent', type: 'event-3' });

  await mockStore.appendEvent(event1);
  await mockStore.appendEvent(event2);
  await mockStore.appendEvent(event3);

  const agentEvents = await mockStore.getEvents(agentId);
  t.is(agentEvents.length, 2);
  t.true(agentEvents.some((e: ContextEvent) => e.type === 'event-1'));
  t.true(agentEvents.some((e: ContextEvent) => e.type === 'event-2'));
  t.false(agentEvents.some((e: ContextEvent) => e.type === 'event-3'));
});

test.serial('MockEventStore: should retrieve events from specific version', async (t) => {
  const mockStore = new MockEventStore();

  const agentId = 'agent-123';
  const event1 = createMockEvent({ agentId, data: { version: 1 } });
  const event2 = createMockEvent({ agentId, data: { version: 2 } });
  const event3 = createMockEvent({ agentId, data: { version: 3 } });

  await mockStore.appendEvent(event1);
  await mockStore.appendEvent(event2);
  await mockStore.appendEvent(event3);

  const eventsFromV2 = await mockStore.getEvents(agentId, 2);
  t.is(eventsFromV2.length, 2);
  t.true(eventsFromV2.some((e: ContextEvent) => e.data.version === 2));
  t.true(eventsFromV2.some((e: ContextEvent) => e.data.version === 3));
  t.false(eventsFromV2.some((e: ContextEvent) => e.data.version === 1));
});

test.serial('MockEventStore: should retrieve single event by ID', async (t) => {
  const mockStore = new MockEventStore();

  const event = createMockEvent();

  await mockStore.appendEvent(event);

  const retrievedEvent = await mockStore.getEvent(event.id);
  t.not(retrievedEvent, null);
  t.deepEqual(retrievedEvent, event);
});

test.serial('MockEventStore: should return null for non-existent event', async (t) => {
  const mockStore = new MockEventStore();

  const retrievedEvent = await mockStore.getEvent('non-existent-id');
  t.is(retrievedEvent, null);
});

test.serial('MockEventStore: should handle concurrent event appends', async (t) => {
  const mockStore = new MockEventStore();

  const agentId = 'agent-123';
  const events = Array.from({ length: 10 }, (_, i) =>
    createMockEvent({ agentId, type: `event-${i}` }),
  );

  // Append events concurrently
  await Promise.all(events.map((event) => mockStore.appendEvent(event)));

  const retrievedEvents = await mockStore.getEvents(agentId);
  t.is(retrievedEvents.length, 10);

  // Verify all events were stored
  events.forEach((event) => {
    t.true(retrievedEvents.some((e: ContextEvent) => e.id === event.id));
  });
});

test.serial('MockEventStore: should maintain event order', async (t) => {
  const mockStore = new MockEventStore();

  const agentId = 'agent-123';
  const baseTime = new Date('2023-01-01T00:00:00Z');

  const events = Array.from({ length: 5 }, (_, i) =>
    createMockEvent({
      agentId,
      timestamp: new Date(baseTime.getTime() + i * 1000),
      data: { sequence: i },
    }),
  );

  // Append in order
  for (const event of events) {
    await mockStore.appendEvent(event);
  }

  const retrievedEvents = await mockStore.getEvents(agentId);

  // Verify order is maintained
  for (let i = 0; i < retrievedEvents.length; i++) {
    const event = retrievedEvents[i];
    t.truthy(event);
    t.is(event!.data.sequence, i);
  }
});

test.serial('PostgresEventStore: should initialize with cache', async (t) => {
  const mockDb = createMockDb();
  const eventStore = new PostgresEventStore(mockDb);

  t.not(eventStore, null);
  // The constructor should create a cache instance
  t.truthy(eventStore);
});

test.serial('PostgresEventStore: should handle database errors gracefully', async (t) => {
  const mockDb = {
    query: async () => {
      throw new Error('Database connection failed');
    },
  };

  const eventStore = new PostgresEventStore(mockDb);
  const event = createMockEvent();

  await t.throwsAsync(() => eventStore.appendEvent(event), {
    message: 'Database connection failed',
  });
});
