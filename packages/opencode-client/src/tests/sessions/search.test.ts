// Ensure test environment is set before any imports
if (process.env.AGENT_NAME !== 'test_agent') {
  process.env.AGENT_NAME = 'test_agent';
}

import test from 'ava';
import sinon from 'sinon';
import { search } from '../../actions/sessions/search.js';
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
async function insertSession(id: string, title: string, description?: string) {
  const session = { id, title, description } as any;
  await sessionStore.insert({ id, text: JSON.stringify(session), timestamp: Date.now() });
}

test.serial('search returns sessions matching query', async (t) => {
  // Insert two matching sessions and one non-matching
  await insertSession('session_1', 'Test Session One', 'First test session');
  await insertSession('session_2', 'Another Session', 'Second session');
  await sessionStore.insert({
    id: 'session_1:messages',
    text: JSON.stringify([]),
    timestamp: Date.now(),
  });
  await sessionStore.insert({
    id: 'session_2:messages',
    text: JSON.stringify([]),
    timestamp: Date.now(),
  });

  const result = await search({ query: 'test' });

  t.true('results' in result);
  t.false('error' in result);
  if ('results' in result) {
    t.is(result.results.length, 1);
    t.is(result.results[0]?.id, 'session_1');
  }
});

test.serial('search returns empty results when no sessions match', async (t) => {
  // Clear and insert a non-matching session
  const { getMongoClient } = await import('@promethean-os/persistence');
  const mongoClient = await getMongoClient();
  const db = mongoClient.db('database');
  await db.collection('test_agent_sessionStore').deleteMany({});
  await db.collection('test_agent_sessionStore').insertOne({
    id: 'session_not_matching',
    text: JSON.stringify({ id: 'session_not_matching', title: 'Different' }),
    timestamp: Date.now(),
  });

  const result = await search({ query: 'nomatch' });
  t.true('results' in result);
  t.false('error' in result);
  if ('results' in result) {
    t.is(result.results.length, 0);
  }
});

test.serial('search respects sessionId filter', async (t) => {
  // Insert two sessions
  await insertSession('session_1', 'Test Session One');
  await insertSession('session_2', 'Test Session Two');
  await sessionStore.insert({
    id: 'session_session_2:messages',
    text: JSON.stringify([]),
    timestamp: Date.now(),
  });

  const result = await search({ query: 'test', sessionId: 'session_2' });
  t.true('results' in result);
  if ('results' in result) {
    t.is(result.results.length, 1);
    t.is(result.results[0]?.id, 'session_2');
  }
});

test.serial('search respects k limit parameter', async (t) => {
  // Insert 5 matching sessions
  for (let i = 1; i <= 5; i++) {
    await insertSession(`session_${i}`, `Test Session ${i}`);
    await sessionStore.insert({
      id: `session_${i}:messages`,
      text: JSON.stringify([]),
      timestamp: Date.now(),
    });
  }

  const result = await search({ query: 'test', k: 3 });
  t.true('results' in result);
  if ('results' in result) {
    t.is(result.results.length, 3);
  }
});

test.serial('search handles empty session store', async (t) => {
  const { getMongoClient } = await import('@promethean-os/persistence');
  const mongoClient = await getMongoClient();
  const db = mongoClient.db('database');
  await db.collection('test_agent_sessionStore').deleteMany({});

  const result = await search({ query: 'test' });
  t.true('results' in result);
  t.false('error' in result);
  if ('results' in result) {
    t.is(result.results.length, 0);
  }
});

test.after.always(async () => {
  await sessionStore.cleanup();
});