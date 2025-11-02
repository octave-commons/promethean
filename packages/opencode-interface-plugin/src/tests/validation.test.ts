// SPDX-License-Identifier: GPL-3.0-only

import test from 'ava';
import { validate } from '../utils/validation.js';

test('validate.string() validates strings', (t) => {
  t.is(validate.string('test', 'param'), 'test');
});

test('validate.string() throws on non-strings', (t) => {
  t.throws(() => validate.string(123, 'param'), {
    message: "Parameter 'param' must be a string, received number",
  });
});

test('validate.optionalString() returns undefined for undefined', (t) => {
  t.is(validate.optionalString(undefined, 'param'), undefined);
});

test('validate.optionalString() validates strings', (t) => {
  t.is(validate.optionalString('test', 'param'), 'test');
});

test('validate.number() validates numbers', (t) => {
  t.is(validate.number(42, 'param'), 42);
});

test('validate.number() throws on non-numbers', (t) => {
  t.throws(() => validate.number('42', 'param'), {
    message: "Parameter 'param' must be a number, received string",
  });
});

test('validate.limit() uses default value', (t) => {
  t.is(validate.limit(undefined, 50), 50);
});

test('validate.limit() validates provided value', (t) => {
  t.is(validate.limit(25, 50), 25);
});

test('validate.limit() throws on zero', (t) => {
  t.throws(() => validate.limit(0, 50), {
    message: 'Limit must be greater than 0',
  });
});

test('validate.limit() throws on negative', (t) => {
  t.throws(() => validate.limit(-10, 50), {
    message: 'Limit must be greater than 0',
  });
});

test('validate.limit() throws on too large', (t) => {
  t.throws(() => validate.limit(2000, 50), {
    message: 'Limit cannot exceed 1000',
  });
});

test('validate.sessionId() validates session IDs', (t) => {
  t.is(validate.sessionId('session-123'), 'session-123');
});

test('validate.sessionId() throws on empty', (t) => {
  t.throws(() => validate.sessionId(''), {
    message: 'Session ID cannot be empty',
  });
});

test('validate.sessionId() throws on undefined', (t) => {
  t.throws(() => validate.sessionId(undefined), {
    message: 'Session ID is required',
  });
});

test('validate.searchQuery() returns empty string for undefined', (t) => {
  t.is(validate.searchQuery(undefined), '');
});

test('validate.searchQuery() validates queries', (t) => {
  t.is(validate.searchQuery('test query'), 'test query');
});

test('validate.searchQuery() throws on empty', (t) => {
  t.throws(() => validate.searchQuery(''), {
    message: 'Search query cannot be empty',
  });
});
