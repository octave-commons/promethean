import test from 'ava';
import sinon from 'sinon';
import { list, type ListSessionsResult } from '../../actions/sessions/list.js';
import { SessionUtils } from '../../SessionUtils.js';

// Mock the sessionStore
const mockSessionStore = {
  getMostRecent: sinon.stub(),
};

// Mock SessionUtils
const createSessionInfoStub = sinon
  .stub(SessionUtils, 'createSessionInfo')
  .callsFake((session: any, messageCount: number) => ({
    id: session.id,
    title: session.title,
    messageCount,
    activityStatus: 'active',
    isAgentTask: false,
    lastActivityTime: new Date().toISOString(),
    sessionAge: 0,
  }));

test('list sessions successfully', async (t) => {
  const mockSessions = [
    {
      id: 'session-1',
      title: 'Session 1',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'session-2',
      title: 'Session 2',
      createdAt: '2023-01-02T00:00:00.000Z',
    },
  ];

  mockSessionStore.getMostRecent.resolves(
    mockSessions.map((session) => ({
      id: `session:${session.id}`,
      text: JSON.stringify(session),
      timestamp: new Date(session.createdAt).getTime(),
    })),
  );

  const result = await list({ limit: 10, offset: 0 });

  t.false('error' in result);
  if (!('error' in result)) {
    t.is(result.totalCount, 2);
    t.is(result.sessions.length, 2);
    t.is(result.pagination.limit, 10);
    t.is(result.pagination.offset, 0);
    t.is(result.pagination.hasMore, false);
    t.is(result.pagination.currentPage, 1);
    t.is(result.pagination.totalPages, 1);
  }
});

test('list sessions with pagination', async (t) => {
  const mockSessions = Array.from({ length: 25 }, (_, i) => ({
    id: `session-${i + 1}`,
    title: `Session ${i + 1}`,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  }));

  mockSessionStore.getMostRecent.resolves(
    mockSessions.map((session) => ({
      id: `session:${session.id}`,
      text: JSON.stringify(session),
      timestamp: new Date(session.createdAt).getTime(),
    })),
  );

  const result = await list({ limit: 10, offset: 5 });

  t.false('error' in result);
  if (!('error' in result)) {
    t.is(result.totalCount, 25);
    t.is(result.sessions.length, 10);
    t.is(result.pagination.limit, 10);
    t.is(result.pagination.offset, 5);
    t.is(result.pagination.hasMore, true);
    t.is(result.pagination.currentPage, 1);
    t.is(result.pagination.totalPages, 3);
  }
});

test('list sessions with no sessions', async (t) => {
  mockSessionStore.getMostRecent.resolves([]);

  const result = await list({ limit: 10, offset: 0 });

  t.false('error' in result);
  if (!('error' in result)) {
    t.is(result.totalCount, 0);
    t.is(result.sessions.length, 0);
    t.is(result.pagination.limit, 10);
    t.is(result.pagination.offset, 0);
    t.is(result.pagination.hasMore, false);
    t.is(result.pagination.currentPage, 1);
    t.is(result.pagination.totalPages, 0);
  }
});

test('list sessions with malformed data', async (t) => {
  const mockEntries = [
    {
      id: 'session:valid',
      text: JSON.stringify({
        id: 'valid-session',
        title: 'Valid Session',
        createdAt: '2023-01-01T00:00:00.000Z',
      }),
      timestamp: Date.now(),
    },
    {
      id: 'session:invalid',
      text: 'Session: invalid-format',
      timestamp: Date.now(),
    },
  ];

  mockSessionStore.getMostRecent.resolves(mockEntries);

  const result = await list({ limit: 10, offset: 0 });

  t.false('error' in result);
  if (!('error' in result)) {
    t.is(result.totalCount, 2);
    t.is(result.sessions.length, 2);
  }
});

test('list sessions with error in store', async (t) => {
  mockSessionStore.getMostRecent.rejects(new Error('Store error'));

  const result = await list({ limit: 10, offset: 0 });

  t.true('error' in result);
  if ('error' in result) {
    t.true(result.error.includes('Failed to list sessions'));
    t.true(result.error.includes('Store error'));
  }
});

test('list sessions calculates summary correctly', async (t) => {
  const mockSessions = [
    { id: 'session-1', title: 'Active Session', createdAt: '2023-01-01T00:00:00.000Z' },
    { id: 'session-2', title: 'Idle Session', createdAt: '2023-01-02T00:00:00.000Z' },
    { id: 'session-3', title: 'Agent Task', createdAt: '2023-01-03T00:00:00.000Z' },
  ];

  // Mock SessionUtils to return different activity statuses
  createSessionInfoStub.restore();
  sinon.stub(SessionUtils, 'createSessionInfo').callsFake((session: any, messageCount: number) => {
    const baseInfo = {
      id: session.id,
      title: session.title,
      messageCount,
      lastActivityTime: new Date().toISOString(),
      sessionAge: 0,
    };

    if (session.id === 'session-1') {
      return { ...baseInfo, activityStatus: 'active', isAgentTask: false };
    } else if (session.id === 'session-2') {
      return { ...baseInfo, activityStatus: 'waiting_for_input', isAgentTask: false };
    } else {
      return { ...baseInfo, activityStatus: 'idle', isAgentTask: true };
    }
  });

  mockSessionStore.getMostRecent.resolves(
    mockSessions.map((session) => ({
      id: `session:${session.id}`,
      text: JSON.stringify(session),
      timestamp: new Date(session.createdAt).getTime(),
    })),
  );

  const result = await list({ limit: 10, offset: 0 });

  t.false('error' in result);
  if (!('error' in result)) {
    t.is(result.summary.active, 1);
    t.is(result.summary.waiting_for_input, 1);
    t.is(result.summary.idle, 1);
    t.is(result.summary.agentTasks, 1);
  }
});

test('type checking - result has correct structure', async (t) => {
  mockSessionStore.getMostRecent.resolves([]);

  const result = await list({ limit: 10, offset: 0 });

  // Type assertion to ensure result matches ListSessionsResult
  const typedResult: ListSessionsResult = result;

  if ('error' in typedResult) {
    t.is(typeof typedResult.error, 'string');
  } else {
    t.true(Array.isArray(typedResult.sessions));
    t.is(typeof typedResult.totalCount, 'number');
    t.is(typeof typedResult.pagination.limit, 'number');
    t.is(typeof typedResult.pagination.offset, 'number');
    t.is(typeof typedResult.pagination.hasMore, 'boolean');
    t.is(typeof typedResult.pagination.currentPage, 'number');
    t.is(typeof typedResult.pagination.totalPages, 'number');
    t.is(typeof typedResult.summary.active, 'number');
    t.is(typeof typedResult.summary.waiting_for_input, 'number');
    t.is(typeof typedResult.summary.idle, 'number');
    t.is(typeof typedResult.summary.agentTasks, 'number');
  }
});

test('handles large limit and offset values', async (t) => {
  const mockSessions = Array.from({ length: 5 }, (_, i) => ({
    id: `session-${i + 1}`,
    title: `Session ${i + 1}`,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  }));

  mockSessionStore.getMostRecent.resolves(
    mockSessions.map((session) => ({
      id: `session:${session.id}`,
      text: JSON.stringify(session),
      timestamp: new Date(session.createdAt).getTime(),
    })),
  );

  const result = await list({ limit: 100, offset: 50 });

  t.false('error' in result);
  if (!('error' in result)) {
    t.is(result.totalCount, 5);
    t.is(result.sessions.length, 0); // No sessions due to high offset
    t.is(result.pagination.limit, 100);
    t.is(result.pagination.offset, 50);
    t.is(result.pagination.hasMore, false);
  }
});
