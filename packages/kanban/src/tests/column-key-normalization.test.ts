import test from 'ava';
import { columnKey } from '../lib/kanban.js';
import { TransitionRulesEngine } from '../lib/transition-rules.js';

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

test('normalizeColumnName matches columnKey behavior', (t: any) => {
  // Create a transition rules engine to access the normalizeColumnName method
  const engine = new TransitionRulesEngine({
    enabled: false,
    enforcement: 'warn',
    rules: [],
    globalRules: [],
    customChecks: {},
  });

  // Access the private normalizeColumnName method via reflection
  const normalizeColumnName = (engine as any).normalizeColumnName.bind(engine);

  const testCases = [
    'in_progress',
    'in-progress',
    'in progress',
    'todo',
    'to_do',
    'to-do',
    'done',
    'in_review',
    'in-review',
    'in review',
    'test_case',
    'test-case',
    'test case',
    'test@case',
    'test#case',
    'test_case_123',
  ];

  testCases.forEach((input) => {
    const columnKeyResult = columnKey(input);
    const normalizeResult = normalizeColumnName(input);
    t.is(
      normalizeResult,
      columnKeyResult,
      `normalizeColumnName("${input}") should return "${columnKeyResult}", got "${normalizeResult}"`,
    );
  });
});
