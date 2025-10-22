import test from 'ava';
import sinon from 'sinon';
import { get, type GetSessionResult } from '../../actions/sessions/get.js';
import { SessionUtils } from '../../SessionUtils.js';

// Mock the sessionStore
const mockSessionStore = {
  get: sinon.stub(),
  getMostRecent: sinon.stub(),
};

// Mock SessionUtils
sinon.stub(SessionUtils, 'createSessionInfo').callsFake((session: any, messageCount: number) => ({
  id: session.id,
  title: session.title,
  messageCount,
  activityStatus: 'active',
  isAgentTask: false,
  lastActivityTime: new Date().toISOString(),
  sessionAge: 0,
}));

test('get session successfully', async (t) => {
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

  mockSessionStore.get.withArgs(sessionId).resolves({
    text: JSON.stringify(mockSession),
    id: sessionId,
  });
  mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves({
    text: JSON.stringify(mockMessages),
  });

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.is(session.title, 'Test Session');
    t.deepEqual(result.messages, mockMessages);
  }
});

test('get session with pagination', async (t) => {
  const sessionId = 'test-session-456';
  const mockSession = {
    id: sessionId,
    title: 'Test Session with Pagination',
    createdAt: '2023-01-01T00:00:00.000Z',
  };
  const mockMessages = Array.from({ length: 10 }, (_, i) => ({
    id: `msg${i + 1}`,
    content: `Message ${i + 1}`,
  }));

  mockSessionStore.get.withArgs(sessionId).resolves({
    text: JSON.stringify(mockSession),
    id: sessionId,
  });
  mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves({
    text: JSON.stringify(mockMessages),
  });

  const result = await get({ sessionId, limit: 5, offset: 2 });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.is(result.messages.length, 5); // Should be limited to 5
    t.is((result.messages[0] as any).id, 'msg3'); // Should start from offset 2
  }
});

test('get session with no messages', async (t) => {
  const sessionId = 'test-session-no-messages';
  const mockSession = {
    id: sessionId,
    title: 'Empty Session',
    createdAt: '2023-01-01T00:00:00.000Z',
  };

  mockSessionStore.get.withArgs(sessionId).resolves({
    text: JSON.stringify(mockSession),
    id: sessionId,
  });
  mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves(null);

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.deepEqual(result.messages, []);
  }
});

test('get session that does not exist', async (t) => {
  const sessionId = 'non-existent-session';

  mockSessionStore.get.withArgs(sessionId).resolves(null);

  const result = await get({ sessionId });

  t.true('error' in result);
  if ('error' in result) {
    t.is(result.error, 'Session not found in dual store');
  }
});

test('get session with malformed session data', async (t) => {
  const sessionId = 'malformed-session';
  const malformedText = 'Session: invalid-format';

  mockSessionStore.get.withArgs(sessionId).resolves({
    text: malformedText,
    id: sessionId,
    timestamp: Date.now(),
  });
  mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves({
    text: '[]',
  });

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.is(session.title, 'Legacy Session');
  }
});

test('get session with malformed message data', async (t) => {
  const sessionId = 'malformed-messages-session';
  const mockSession = {
    id: sessionId,
    title: 'Session with Bad Messages',
    createdAt: '2023-01-01T00:00:00.000Z',
  };

  mockSessionStore.get.withArgs(sessionId).resolves({
    text: JSON.stringify(mockSession),
    id: sessionId,
  });
  mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves({
    text: 'invalid json [',
  });

  const result = await get({ sessionId });

  t.false('error' in result);
  if ('session' in result) {
    const session = result.session as any;
    t.is(session.id, sessionId);
    t.deepEqual(result.messages, []); // Should default to empty array
  }
});

test('type checking - result has correct structure', async (t) => {
  const sessionId = 'type-check-session';
  const mockSession = {
    id: sessionId,
    title: 'Type Check Session',
    createdAt: '2023-01-01T00:00:00.000Z',
  };

  mockSessionStore.get.withArgs(sessionId).resolves({
    text: JSON.stringify(mockSession),
    id: sessionId,
  });
  mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves({
    text: '[]',
  });

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

test('handles different timestamp formats', async (t) => {
  const sessionId = 'timestamp-test';
  const timestampFormats = [Date.now(), '2023-01-01T00:00:00.000Z', new Date()];

  for (const timestamp of timestampFormats) {
    mockSessionStore.get.withArgs(sessionId).resolves({
      text: JSON.stringify({
        id: sessionId,
        title: 'Timestamp Test',
        createdAt: timestamp,
      }),
      id: sessionId,
      timestamp,
    });
    mockSessionStore.get.withArgs(`session:${sessionId}:messages`).resolves({
      text: '[]',
    });

    const result = await get({ sessionId });

    t.false('error' in result);
    if ('session' in result) {
      const session = result.session as any;
      t.is(session.id, sessionId);
    }
  }
});
