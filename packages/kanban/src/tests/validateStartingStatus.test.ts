import test from 'ava';
import { validateStartingStatus } from '../lib/kanban-compatibility.js';

// RED PHASE: These tests should initially fail because we need comprehensive validation

test('validateStartingStatus allows "icebox" as valid starting status', async (t) => {
  await t.notThrowsAsync(() => validateStartingStatus('icebox'));
});

test('validateStartingStatus allows "incoming" as valid starting status', async (t) => {
  await t.notThrowsAsync(() => validateStartingStatus('incoming'));
});

test('validateStartingStatus allows case-insensitive "icebox"', async (t) => {
  await t.notThrowsAsync(() => validateStartingStatus('ICEBOX'));
  await t.notThrowsAsync(() => validateStartingStatus('IceBox'));
  await t.notThrowsAsync(() => validateStartingStatus('iceBox'));
});

test('validateStartingStatus allows case-insensitive "incoming"', async (t) => {
  await t.notThrowsAsync(() => validateStartingStatus('INCOMING'));
  await t.notThrowsAsync(() => validateStartingStatus('Incoming'));
  await t.notThrowsAsync(() => validateStartingStatus('inComing'));
});

test('validateStartingStatus rejects "todo" as invalid starting status', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus('todo'));
  t.true(error.message.includes('Invalid starting status: "todo"'));
  t.true(
    error.message.includes('Tasks can only be created with starting statuses: icebox, incoming'),
  );
  t.true(error.message.includes('Use --status flag to specify a valid starting status'));
});

test('validateStartingStatus rejects "done" as invalid starting status', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus('done'));
  t.true(error.message.includes('Invalid starting status: "done"'));
  t.true(error.message.includes('icebox, incoming'));
});

test('validateStartingStatus rejects "in-progress" as invalid starting status', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus('in-progress'));
  t.true(error.message.includes('Invalid starting status: "in-progress"'));
});

test('validateStartingStatus rejects "ready" as invalid starting status', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus('ready'));
  t.true(error.message.includes('Invalid starting status: "ready"'));
});

test('validateStartingStatus rejects empty string', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus(''));
  t.true(error.message.includes('Invalid starting status: ""'));
});

test('validateStartingStatus rejects whitespace-only string', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus('   '));
  t.true(error.message.includes('Invalid starting status: "   "'));
});

test('validateStartingStatus rejects null-like inputs', async (t) => {
  // Test with string representations of null/undefined
  const error1 = await t.throwsAsync(() => validateStartingStatus('null'));
  t.true(error1.message.includes('Invalid starting status: "null"'));

  const error2 = await t.throwsAsync(() => validateStartingStatus('undefined'));
  t.true(error2.message.includes('Invalid starting status: "undefined"'));
});

test('validateStartingStatus rejects random invalid statuses', async (t) => {
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
    const error = await t.throwsAsync(() => validateStartingStatus(status));
    t.true(error.message.includes(`Invalid starting status: "${status}"`));
  }
});

test('validateStartingStatus handles normalized column keys correctly', async (t) => {
  // Test that column key normalization works
  await t.notThrowsAsync(() => validateStartingStatus('Ice Box')); // Should normalize to 'icebox'
  await t.notThrowsAsync(() => validateStartingStatus('In-Coming')); // Should normalize to 'incoming'

  const error = await t.throwsAsync(() => validateStartingStatus('To Do')); // Should normalize to 'todo' and reject
  t.true(error.message.includes('Invalid starting status: "To Do"'));
});

test('validateStartingStatus error message provides helpful guidance', async (t) => {
  const error = await t.throwsAsync(() => validateStartingStatus('invalid-status'));

  // Verify error message contains all expected elements
  t.true(error.message.includes('Invalid starting status'));
  t.true(error.message.includes('"invalid-status"'));
  t.true(error.message.includes('Tasks can only be created with starting statuses'));
  t.true(error.message.includes('icebox, incoming'));
  t.true(error.message.includes('Use --status flag'));
});

test('validateStartingStatus handles special characters in status names', async (t) => {
  const specialCases = ['icebox!', 'incoming?', 'icebox@home', 'incoming-work'];

  for (const status of specialCases) {
    const error = await t.throwsAsync(() => validateStartingStatus(status));
    t.true(error.message.includes(`Invalid starting status: "${status}"`));
  }
});
