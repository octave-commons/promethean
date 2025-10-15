import test from 'ava';
import { columnKey } from '../lib/kanban.js';

test('columnKey normalization consistency', (t: any) => {
  const testCases = [
    { input: 'in_progress', expected: 'in_progress' },
    { input: 'in-progress', expected: 'in_progress' },
    { input: 'in progress', expected: 'in_progress' },
    { input: 'todo', expected: 'todo' },
    { input: 'to_do', expected: 'to_do' },
    { input: 'to-do', expected: 'to_do' },
    { input: 'done', expected: 'done' },
    { input: 'in_review', expected: 'in_review' },
    { input: 'in-review', expected: 'in_review' },
    { input: 'in review', expected: 'in_review' },
  ];

  testCases.forEach(({ input, expected }) => {
    const result = columnKey(input);
    t.is(result, expected, `columnKey("${input}") should return "${expected}", got "${result}"`);
  });
});

test('columnKey handles edge cases', (t: any) => {
  // Test that underscores are preserved and spaces/hyphens convert to underscores
  t.is(columnKey('test_case'), 'test_case');
  t.is(columnKey('test-case'), 'test_case');
  t.is(columnKey('test case'), 'test_case');
  t.is(columnKey('test@case'), 'testcase');
  t.is(columnKey('test#case'), 'testcase');
  t.is(columnKey('test_case_123'), 'test_case_123');
});
