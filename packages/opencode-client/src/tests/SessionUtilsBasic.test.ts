import test from 'ava';
import sinon from 'sinon';
import { SessionUtils } from '../SessionUtils.js';

test.beforeEach(() => {
  sinon.restore();
});

test('SessionUtils is exported correctly', (t) => {
  t.is(typeof SessionUtils, 'object');
  t.is(typeof SessionUtils.extractSessionId, 'function');
  t.is(typeof SessionUtils.getSessionMessages, 'function');
  t.is(typeof SessionUtils.determineActivityStatus, 'function');
  t.is(typeof SessionUtils.createSessionInfo, 'function');
});

test('determineActivityStatus basic logic', (t) => {
  // Test without agent task
  let result = SessionUtils.determineActivityStatus({ id: 'test' }, 5);
  t.is(result, 'active');

  result = SessionUtils.determineActivityStatus({ id: 'test' }, 25);
  t.is(result, 'waiting_for_input');

  result = SessionUtils.determineActivityStatus({ id: 'test' }, 60);
  t.is(result, 'idle');
});
