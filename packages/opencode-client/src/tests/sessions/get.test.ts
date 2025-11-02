// Ensure test environment is set before any imports
if (process.env.AGENT_NAME !== 'test_agent') {
  process.env.AGENT_NAME = 'test_agent';
}

import test from 'ava';
import sinon from 'sinon';
import { get, type GetSessionResult } from '../../actions/sessions/get.js';
import { sessionStore } from '../../index.js';
import { initializeStores } from '../../initializeStores.js';

// Initialize stores before tests to use real DB-based data
test.before(async () => {
  await initializeStores();
});

test.beforeEach(async () => {
  // reset stubs
  sinon.restore();
  // Clean test_agent collection before each test
  try {
    const { getMongoClient } = await import('@promethean-os/persistence');
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('database');
    const res = await db.collection('test_agent_sessionStore').deleteMany({});
    console.log(`Cleared test_agent_sessionStore, deleted ${res.deletedCount} documents`);
  } catch (e) {
    console.log('Cleanup error:', e);
  }
});

// Helper to insert a session into the real store
async function insertSession(id: string, title: string, createdAt?: string) {
  const session = { id, title, createdAt: createdAt || new Date().toISOString() } as any;
  await sessionStore.insert({ id, text: JSON.stringify(session), timestamp: Date.now() });
}

// Helper to insert messages into the real store
async function insertMessages(sessionId: string, messages: any[]) {
  await sessionStore.insert({
    id: `session:${sessionId}:messages`,
    text: JSON.stringify(messages),
    timestamp: Date.now(),
  });
}

test.serial('get session successfully', async (t) => {
  const sessionId = 'test-session-123';
  const mockSession = {
    id: sessionId,
    title: 'Test Session',
    createdAt: '2023-01-01T00:00:00.000Z',
  };
  const mockMessages = [
    { id: 'msg1', content: 'Hello' },
    { id: 'msg2', content: 'World' },
  ];

  await insertSession(sessionId, mockSession.title, mockSession.createdAt);
  await insertMessages(sessionId, mockMessages);

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.is(session.title, 'Test Session');
    t.deepEqual(result.messages, mockMessages);
  }
});

test.serial('get session with pagination', async (t) => {
  const sessionId = 'test-session-456';
  const mockMessages = Array.from({ length: 10 }, (_, i) => ({
    id: `msg${i + 1}`,
    content: `Message ${i + 1}`,
  }));

  await insertSession(sessionId, 'Test Session with Pagination');
  await insertMessages(sessionId, mockMessages);

  const result = await get({ sessionId, limit: 5, offset: 2 });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.is(result.messages.length, 5); // Should be limited to 5
    t.is((result.messages[0] as any).id, 'msg3'); // Should start from offset 2
  }
});

test.serial('get session with no messages', async (t) => {
  const sessionId = 'test-session-no-messages';

  await insertSession(sessionId, 'Empty Session');

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.deepEqual(result.messages, []);
  }
});

test.serial('get session that does not exist', async (t) => {
  const sessionId = 'non-existent-session';

  const result = await get({ sessionId });

  t.true('error' in result);
  if ('error' in result) {
    t.is(result.error, 'Session not found in dual store');
  }
});

test.serial('get session with malformed session data', async (t) => {
  const sessionId = 'malformed-session';
  const malformedText = 'Session: invalid-format';

  await sessionStore.insert({
    id: sessionId,
    text: malformedText,
    timestamp: Date.now(),
  });

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, 'invalid');
    t.is(session.title, 'Session invalid');
  }
});



test.serial('get session with malformed message data', async (t) => {
  const sessionId = 'malformed-messages-session';

  await insertSession(sessionId, 'Session with Bad Messages');
  await sessionStore.insert({
    id: `session:${sessionId}:messages`,
    text: 'invalid json [',
    timestamp: Date.now(),
  });

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.deepEqual(result.messages, []); // Should default to empty array
  }
});

test.serial('type checking - result has correct structure', async (t) => {
  const sessionId = 'type-check-session';

  await insertSession(sessionId, 'Type Check Session');

  const result = await get({ sessionId });

  // Type assertion to ensure result matches GetSessionResult
  const typedResult: GetSessionResult = result;

  if ('error' in typedResult) {
    t.is(typeof typedResult.error, 'string');
  } else {
    const successResult = typedResult as { session: unknown; messages: unknown[] };
    t.true('session' in successResult);
    t.true('messages' in successResult);
    t.true(Array.isArray(successResult.messages));
  }
});

test.serial('handles different timestamp formats', async (t) => {
  const sessionId = 'timestamp-test';
  const timestampFormats = [Date.now(), '2023-01-01T00:00:00.000Z', new Date()];

  for (const timestamp of timestampFormats) {
    await sessionStore.insert({
      id: sessionId,
      text: JSON.stringify({
        id: sessionId,
        title: 'Timestamp Test',
        createdAt: timestamp,
      }),
      timestamp,
    });
    await sessionStore.insert({
      id: `session:${sessionId}:messages`,
      text: '[]',
      timestamp: Date.now(),
    });

    const result = await get({ sessionId });

    t.false('error' in result);
    if ('session' in result) {
      const session = result.session as any;
      t.is(session.id, sessionId);
    }
  }
});

test.after.always(async () => {
  await sessionStore.cleanup();
});