import test from 'ava';
import { close, type CloseSessionResult } from '../../actions/sessions/close.js';

test('close session successfully', async (t) => {
  const sessionId = 'test-session-123';

  const result = await close({ sessionId });

  t.true(result.success);
  t.is(result.sessionId, sessionId);
  t.is(result.message, 'Session closed successfully');
});

test('close session with different session ID', async (t) => {
  const sessionId = 'another-session-456';

  const result = await close({ sessionId });

  t.true(result.success);
  t.is(result.sessionId, sessionId);
  t.is(result.message, 'Session closed successfully');
});

test('close session with empty session ID', async (t) => {
  const sessionId = '';

  const result = await close({ sessionId });

  t.true(result.success);
  t.is(result.sessionId, '');
  t.is(result.message, 'Session closed successfully');
});

test('close session with special characters in ID', async (t) => {
  const sessionId = 'session-with-special-chars_123!@#';

  const result = await close({ sessionId });

  t.true(result.success);
  t.is(result.sessionId, sessionId);
  t.is(result.message, 'Session closed successfully');
});

test('type checking - result has correct structure', async (t) => {
  const sessionId = 'type-check-session';

  const result = await close({ sessionId });

  // Type assertion to ensure result matches CloseSessionResult
  const typedResult: CloseSessionResult = result;
  t.true(typedResult.success);
  t.is(typeof typedResult.sessionId, 'string');
  t.is(typeof typedResult.message, 'string');
});

test('consistent return type for all inputs', async (t) => {
  const testCases = ['session-1', 'session-2', 'session-3'];

  for (const sessionId of testCases) {
    const result = await close({ sessionId });

    t.true(result.success);
    t.is(result.sessionId, sessionId);
    t.is(result.message, 'Session closed successfully');
  }
});
