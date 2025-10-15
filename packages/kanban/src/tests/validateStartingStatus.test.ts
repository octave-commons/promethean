import test from 'ava';
import { validateStartingStatus } from '../lib/kanban.js';

// RED PHASE: These tests should initially fail because we need comprehensive validation

test('validateStartingStatus allows "icebox" as valid starting status', (t) => {
  t.notThrows(() => validateStartingStatus('icebox'));
});

test('validateStartingStatus allows "incoming" as valid starting status', (t) => {
  t.notThrows(() => validateStartingStatus('incoming'));
});

test('validateStartingStatus allows case-insensitive "icebox"', (t) => {
  t.notThrows(() => validateStartingStatus('ICEBOX'));
  t.notThrows(() => validateStartingStatus('IceBox'));
  t.notThrows(() => validateStartingStatus('iceBox'));
});

test('validateStartingStatus allows case-insensitive "incoming"', (t) => {
  t.notThrows(() => validateStartingStatus('INCOMING'));
  t.notThrows(() => validateStartingStatus('Incoming'));
  t.notThrows(() => validateStartingStatus('inComing'));
});

test('validateStartingStatus rejects "todo" as invalid starting status', (t) => {
  const error = t.throws(() => validateStartingStatus('todo'));
  t.true(error.message.includes('Invalid starting status: "todo"'));
  t.true(
    error.message.includes('Tasks can only be created with starting statuses: icebox, incoming'),
  );
  t.true(error.message.includes('Use --status flag to specify a valid starting status'));
});

test('validateStartingStatus rejects "done" as invalid starting status', (t) => {
  const error = t.throws(() => validateStartingStatus('done'));
  t.true(error.message.includes('Invalid starting status: "done"'));
  t.true(error.message.includes('icebox, incoming'));
});

test('validateStartingStatus rejects "in-progress" as invalid starting status', (t) => {
  const error = t.throws(() => validateStartingStatus('in-progress'));
  t.true(error.message.includes('Invalid starting status: "in-progress"'));
});

test('validateStartingStatus rejects "ready" as invalid starting status', (t) => {
  const error = t.throws(() => validateStartingStatus('ready'));
  t.true(error.message.includes('Invalid starting status: "ready"'));
});

test('validateStartingStatus rejects empty string', (t) => {
  const error = t.throws(() => validateStartingStatus(''));
  t.true(error.message.includes('Invalid starting status: ""'));
});

test('validateStartingStatus rejects whitespace-only string', (t) => {
  const error = t.throws(() => validateStartingStatus('   '));
  t.true(error.message.includes('Invalid starting status: "   "'));
});

test('validateStartingStatus rejects null-like inputs', (t) => {
  // Test with string representations of null/undefined
  const error1 = t.throws(() => validateStartingStatus('null'));
  t.true(error1.message.includes('Invalid starting status: "null"'));

  const error2 = t.throws(() => validateStartingStatus('undefined'));
  t.true(error2.message.includes('Invalid starting status: "undefined"'));
});

test('validateStartingStatus rejects random invalid statuses', (t) => {
  const invalidStatuses = [
    'backlog',
    'review',
    'testing',
    'deployed',
    'archived',
    'blocked',
    'priority',
    'custom-status',
    '123',
    '!@#$%',
  ];

  for (const status of invalidStatuses) {
    const error = t.throws(() => validateStartingStatus(status));
    t.true(error.message.includes(`Invalid starting status: "${status}"`));
  }
});

test('validateStartingStatus handles normalized column keys correctly', (t) => {
  // Test that column key normalization works
  t.notThrows(() => validateStartingStatus('Ice Box')); // Should normalize to 'icebox'
  t.notThrows(() => validateStartingStatus('In-Coming')); // Should normalize to 'incoming'

  const error = t.throws(() => validateStartingStatus('To Do')); // Should normalize to 'todo' and reject
  t.true(error.message.includes('Invalid starting status: "To Do"'));
});

test('validateStartingStatus error message provides helpful guidance', (t) => {
  const error = t.throws(() => validateStartingStatus('invalid-status'));

  // Verify error message contains all expected elements
  t.true(error.message.includes('Invalid starting status'));
  t.true(error.message.includes('"invalid-status"'));
  t.true(error.message.includes('Tasks can only be created with starting statuses'));
  t.true(error.message.includes('icebox, incoming'));
  t.true(error.message.includes('Use --status flag'));
});

test('validateStartingStatus handles special characters in status names', (t) => {
  const specialCases = ['icebox!', 'incoming?', 'icebox@home', 'incoming-work'];

  for (const status of specialCases) {
    const error = t.throws(() => validateStartingStatus(status));
    t.true(error.message.includes(`Invalid starting status: "${status}"`));
  }
});
