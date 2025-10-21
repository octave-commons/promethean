import test from 'ava';
import sinon from 'sinon';
import { search } from '../../actions/sessions/search.js';
import { sessionStore, SessionUtils } from '../../index.js';

test.beforeEach(() => {
  sinon.restore();
});

test.serial('search returns sessions matching query', async (t) => {
  const mockSessions = [
    { id: 'session:1', title: 'Test Session One', description: 'First test session' },
    { id: 'session:2', title: 'Another Session', description: 'Second session' },
    { id: 'session:3', title: 'Test Session Two', description: 'Third test session' },
  ];

  const mockMessages = [
    { id: 'msg1', content: 'Hello' },
    { id: 'msg2', content: 'World' },
  ];

  const getMostRecentStub = sinon.stub(sessionStore, 'getMostRecent').resolves([
    { id: 'session:1', text: JSON.stringify(mockSessions[0]), timestamp: Date.now() },
    { id: 'session:2', text: JSON.stringify(mockSessions[1]), timestamp: Date.now() },
    { id: 'session:3', text: JSON.stringify(mockSessions[2]), timestamp: Date.now() },
    { id: 'other:entry', text: 'should be ignored', timestamp: Date.now() },
  ]);

  sinon.stub(sessionStore, 'get').resolves({
    id: 'session:1:messages',
    text: JSON.stringify(mockMessages),
    timestamp: Date.now(),
  });

  const createSessionInfoStub = sinon.stub(SessionUtils, 'createSessionInfo').returns({
    id: 'session:1',
    title: 'Test Session One',
    messageCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  const result = await search({ query: 'test' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.true(createSessionInfoStub.calledThrice);
  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.query, 'test');
    t.is(result.results.length, 2); // Should match 2 sessions with "test" in title
    t.is(result.totalCount, 2);
  }
});

test.serial('search returns empty results when no sessions match', async (t) => {
  const getMostRecentStub = sinon
    .stub(sessionStore, 'getMostRecent')
    .resolves([
      {
        id: 'session:1',
        text: JSON.stringify({ id: 'session:1', title: 'Different Session' }),
        timestamp: Date.now(),
      },
    ]);

  sinon.stub(sessionStore, 'get').resolves(null);

  const result = await search({ query: 'nonexistent' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.query, 'nonexistent');
    t.is(result.results.length, 0);
    t.is(result.totalCount, 0);
  }
});

test.serial('search respects sessionId filter', async (t) => {
  const mockSessions = [
    { id: 'session:1', title: 'Test Session One' },
    { id: 'session:2', title: 'Test Session Two' },
  ];

  const getMostRecentStub = sinon.stub(sessionStore, 'getMostRecent').resolves([
    { id: 'session:1', text: JSON.stringify(mockSessions[0]), timestamp: Date.now() },
    { id: 'session:2', text: JSON.stringify(mockSessions[1]), timestamp: Date.now() },
  ]);

  sinon.stub(sessionStore, 'get').resolves({
    id: 'session:1:messages',
    text: JSON.stringify([]),
    timestamp: Date.now(),
  });

  const createSessionInfoStub = sinon.stub(SessionUtils, 'createSessionInfo').returns({
    id: 'session:1',
    title: 'Test Session One',
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  const result = await search({ query: 'test', sessionId: 'session:1' });

  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.results.length, 1);
    t.is(result.results[0].id, 'session:1');
  }
});

test.serial('search respects k limit parameter', async (t) => {
  const mockSessions = Array.from({ length: 5 }, (_, i) => ({
    id: `session:${i + 1}`,
    title: `Test Session ${i + 1}`,
  }));

  const getMostRecentStub = sinon.stub(sessionStore, 'getMostRecent').resolves(
    mockSessions.map((session) => ({
      id: session.id,
      text: JSON.stringify(session),
      timestamp: Date.now(),
    })),
  );

  sinon.stub(sessionStore, 'get').resolves({
    id: 'session:1:messages',
    text: JSON.stringify([]),
    timestamp: Date.now(),
  });

  const createSessionInfoStub = sinon.stub(SessionUtils, 'createSessionInfo').returns({
    id: 'session:1',
    title: 'Test Session 1',
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  const result = await search({ query: 'test', k: 3 });

  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.results.length, 3); // Should be limited to 3
  }
});

test.serial('search handles empty session store', async (t) => {
  const getMostRecentStub = sinon.stub(sessionStore, 'getMostRecent').resolves([]);

  const result = await search({ query: 'test' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.query, 'test');
    t.is(result.results.length, 0);
    t.is(result.totalCount, 0);
  }
});

test.serial('search handles session store errors gracefully', async (t) => {
  const getMostRecentStub = sinon
    .stub(sessionStore, 'getMostRecent')
    .rejects(new Error('Store error'));

  const result = await search({ query: 'test' });

  t.true(getMostRecentStub.calledOnceWith(1000));
  t.true('error' in result);
  t.false('results' in result);

  if ('error' in result) {
    t.true(result.error.includes('Failed to search sessions'));
    t.true(result.error.includes('Store error'));
  }
});

test.serial('search handles message fetching errors gracefully', async (t) => {
  const mockSessions = [{ id: 'session:1', title: 'Test Session One' }];

  const getMostRecentStub = sinon
    .stub(sessionStore, 'getMostRecent')
    .resolves([{ id: 'session:1', text: JSON.stringify(mockSessions[0]), timestamp: Date.now() }]);

  sinon.stub(sessionStore, 'get').rejects(new Error('Message fetch error'));

  const createSessionInfoStub = sinon.stub(SessionUtils, 'createSessionInfo').returns({
    id: 'session:1',
    title: 'Test Session One',
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  const result = await search({ query: 'test' });

  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.results.length, 1);
    t.is(result.results[0].error, 'Could not fetch messages');
  }
});

test.serial('search filters out non-session entries', async (t) => {
  const getMostRecentStub = sinon.stub(sessionStore, 'getMostRecent').resolves([
    {
      id: 'session:1',
      text: JSON.stringify({ id: 'session:1', title: 'Valid Session' }),
      timestamp: Date.now(),
    },
    { id: 'session:1:messages', text: JSON.stringify([]), timestamp: Date.now() }, // Should be filtered out
    {
      id: 'other:entry',
      text: JSON.stringify({ id: 'other', title: 'Other Entry' }),
      timestamp: Date.now(),
    }, // Should be filtered out
  ]);

  sinon.stub(sessionStore, 'get').resolves(null);

  const createSessionInfoStub = sinon.stub(SessionUtils, 'createSessionInfo').returns({
    id: 'session:1',
    title: 'Valid Session',
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  const result = await search({ query: '' });

  t.true('results' in result);
  t.false('error' in result);

  if ('results' in result) {
    t.is(result.results.length, 1); // Only the valid session should remain
    t.is(result.results[0].id, 'session:1');
  }
});
