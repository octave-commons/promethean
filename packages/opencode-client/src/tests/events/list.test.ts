import test from 'ava';
import sinon from 'sinon';
import { list } from '../../actions/events/list.js';
import { eventStore } from '../../index.js';
import { cleanupClients } from '@promethean-os/persistence';
import { setupTestStores } from '../helpers/test-stores.js';

test.beforeEach(async () => {
  sinon.restore();
  await setupTestStores();
});

test.after.always(async () => {
  await eventStore.cleanup();
  await cleanupClients();
});

test.serial('list returns events sorted by timestamp (newest first)', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', content: 'First event' }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'test', content: 'Second event' }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({ type: 'test', content: 'Third event' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({});

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 3);
  t.is(result[0]!.type, 'test');
  t.is(result[0]!.content, 'Second event'); // Should be first (timestamp 2000)
  t.is(result[1]!.type, 'test');
  t.is(result[1]!.content, 'Third event'); // Should be second (timestamp 1500)
  t.is(result[2]!.type, 'test');
  t.is(result[2]!.content, 'First event'); // Should be third (timestamp 1000)
});

test.serial('list filters events by query', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', content: 'First event' }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'other', content: 'Second event' }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({ type: 'test', description: 'First description' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({ query: 'first' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 2);
  t.true(result.some((event) => event.content === 'First event'));
  t.true(result.some((event) => event.description === 'First description'));
});

test.serial('list filters events by eventType', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', content: 'First event' }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'other', content: 'Second event' }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({ type: 'test', content: 'Third event' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({ eventType: 'test' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 2);
  t.true(result.every((event) => event.type === 'test'));
});

test.serial('list filters events by sessionId', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', sessionId: 'session-1', content: 'First event' }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'test', sessionId: 'session-2', content: 'Second event' }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({ type: 'test', sessionId: 'session-1', content: 'Third event' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({ sessionId: 'session-1' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 2);
  t.true(result.every((event) => event.sessionId === 'session-1'));
});

test.serial('list filters events by hasTool', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', hasTool: true, content: 'First event' }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'test', hasTool: false, content: 'Second event' }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({ type: 'test', hasTool: true, content: 'Third event' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({ hasTool: true });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 2);
  t.true(result.every((event) => event.hasTool === true));
});

test.serial('list filters events by isAgentTask', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', isAgentTask: true, content: 'First event' }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({ type: 'test', isAgentTask: false, content: 'Second event' }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({ type: 'test', isAgentTask: true, content: 'Third event' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({ isAgentTask: false });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 1);
  t.is(result[0]!.isAgentTask, false);
});

test.serial('list applies k limit parameter', async (t) => {
  const mockEvents = Array.from({ length: 5 }, (_, i) => ({
    id: `event:${i + 1}`,
    text: JSON.stringify({ type: 'test', content: `Event ${i + 1}` }),
    timestamp: (i + 1) * 1000,
  }));

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({ k: 3 });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 3);
  t.is(result[0]!.content, 'Event 5'); // Should be newest
  t.is(result[1]!.content, 'Event 4');
  t.is(result[2]!.content, 'Event 3');
});

test.serial('list handles empty event store', async (t) => {
  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves([]);

  const result = await list({});

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 0);
});

test.serial('list handles event store errors gracefully', async (t) => {
  const getMostRecentStub = sinon
    .stub(eventStore, 'getMostRecent')
    .rejects(new Error('Store error'));

  const result = await list({});

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 0);
});

test.serial('list filters out non-event entries', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({ type: 'test', content: 'Valid event' }),
      timestamp: 1000,
    },
    {
      id: 'session:1',
      text: JSON.stringify({ id: 'session:1', title: 'Session entry' }),
      timestamp: 2000,
    },
    {
      id: 'other:entry',
      text: JSON.stringify({ data: 'Other entry' }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({});

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 1);
  t.is(result[0]!.type, 'test');
  t.is(result[0]!.content, 'Valid event');
});

test.serial('list applies multiple filters simultaneously', async (t) => {
  const mockEvents = [
    {
      id: 'event:1',
      text: JSON.stringify({
        type: 'test',
        sessionId: 'session-1',
        hasTool: true,
        isAgentTask: true,
        content: 'First event',
      }),
      timestamp: 1000,
    },
    {
      id: 'event:2',
      text: JSON.stringify({
        type: 'test',
        sessionId: 'session-2',
        hasTool: true,
        isAgentTask: false,
        content: 'Second event',
      }),
      timestamp: 2000,
    },
    {
      id: 'event:3',
      text: JSON.stringify({
        type: 'other',
        sessionId: 'session-1',
        hasTool: false,
        isAgentTask: true,
        content: 'Third event',
      }),
      timestamp: 1500,
    },
  ];

  const getMostRecentStub = sinon.stub(eventStore, 'getMostRecent').resolves(mockEvents);

  const result = await list({
    eventType: 'test',
    sessionId: 'session-1',
    hasTool: true,
    isAgentTask: true,
  });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.is(result.length, 1);
  t.is(result[0]!.type, 'test');
  t.is(result[0]!.sessionId, 'session-1');
  t.is(result[0]!.hasTool, true);
  t.is(result[0]!.isAgentTask, true);
});
