import test from 'ava';
import type {
  ScarContext,
  EventLogEntry,
  ScarRecord,
  SearchResult,
  LLMOperation,
  GitCommit,
  HealingStatus,
  HealingResult,
} from '../lib/heal/scar-context-types.js';
import {
  isEventLogEntry,
  isScarRecord,
  isSearchResult,
  isLLMOperation,
  isGitCommit,
  isHealingStatus,
  isHealingResult,
  isScarContext,
  validateScarContextIntegrity,
  createEventLogEntry,
  createScarRecord,
} from '../lib/heal/type-guards.js';

test('EventLogEntry type validation', (t) => {
  const validEntry: EventLogEntry = {
    timestamp: new Date(),
    operation: 'test-operation',
    details: { key: 'value' },
    severity: 'info',
  };

  t.true(isEventLogEntry(validEntry));

  const invalidEntry = {
    timestamp: 'not-a-date',
    operation: 'test',
    details: {},
    severity: 'invalid',
  };

  t.false(isEventLogEntry(invalidEntry));
});

test('ScarRecord type validation', (t) => {
  const validRecord: ScarRecord = {
    start: 'a'.repeat(40),
    end: 'b'.repeat(40),
    tag: 'v1.0.0',
    story: 'Fixed critical bug',
    timestamp: new Date(),
  };

  t.true(isScarRecord(validRecord));

  const invalidRecord = {
    start: 123, // Should be string
    end: 'also-short',
    tag: '',
    story: '',
    timestamp: new Date(),
  };

  t.false(isScarRecord(invalidRecord));
});

test('SearchResult type validation', (t) => {
  const validResult: SearchResult = {
    taskId: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    relevance: 0.85,
    snippet: 'This is a test snippet',
  };

  t.true(isSearchResult(validResult));

  const invalidResult = {
    taskId: 'invalid-uuid',
    title: 'Test',
    relevance: 1.5, // Over 1.0
    snippet: 'snippet',
  };

  t.false(isSearchResult(invalidResult));
});

test('LLMOperation type validation', (t) => {
  const validOperation: LLMOperation = {
    id: 'op-123',
    operation: 'generate-text',
    input: { prompt: 'test' },
    output: { text: 'result' },
    timestamp: new Date(),
    tokensUsed: 100,
  };

  t.true(isLLMOperation(validOperation));

  const invalidOperation = {
    id: 123, // Should be string
    operation: 'test',
    input: {},
    output: {},
    timestamp: 'not-a-date',
  };

  t.false(isLLMOperation(invalidOperation));
});

test('GitCommit type validation', (t) => {
  const validCommit: GitCommit = {
    sha: 'c'.repeat(40),
    message: 'Fix bug',
    author: 'Test Author',
    timestamp: new Date(),
    files: ['file1.ts', 'file2.ts'],
  };

  t.true(isGitCommit(validCommit));

  const invalidCommit = {
    sha: 'short',
    message: '',
    author: '',
    timestamp: new Date(),
    files: ['valid-file.txt', 123], // Invalid file entry
  };

  t.false(isGitCommit(invalidCommit));
});

test('HealingStatus type validation', (t) => {
  const validStatuses: HealingStatus[] = [
    'pending',
    'in_progress',
    'completed',
    'failed',
    'rolled_back',
  ];

  validStatuses.forEach((status) => {
    t.true(isHealingStatus(status));
  });

  t.false(isHealingStatus('invalid-status'));
});

test('HealingResult type validation', (t) => {
  const validResult: HealingResult = {
    status: 'completed',
    summary: 'Successfully healed 5 tasks',
    tasksModified: 5,
    filesChanged: 3,
    errors: [],
    completedAt: new Date(),
  };

  t.true(isHealingResult(validResult));

  const invalidResult = {
    status: 'invalid-status',
    summary: '',
    tasksModified: -1, // Should be non-negative
    filesChanged: 0,
    errors: ['error'],
  };

  t.false(isHealingResult(invalidResult));
});

test('ScarContext type validation', (t) => {
  const validContext: ScarContext = {
    reason: 'Fix critical security vulnerability',
    eventLog: [
      {
        timestamp: new Date(),
        operation: 'start-healing',
        details: {},
        severity: 'info',
      },
    ],
    previousScars: [
      {
        start: 'a'.repeat(40),
        end: 'b'.repeat(40),
        tag: 'v1.0.0',
        story: 'Previous fix',
        timestamp: new Date(),
      },
    ],
    searchResults: [
      {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Security Task',
        relevance: 0.9,
        snippet: 'Fix security issue',
      },
    ],
    metadata: {
      tag: 'security-fix-2025',
      narrative: 'Fixed template injection vulnerability',
    },
    llmOperations: [
      {
        id: 'llm-1',
        operation: 'analyze-code',
        input: { code: 'example' },
        output: { analysis: 'safe' },
        timestamp: new Date(),
      },
    ],
    gitHistory: [
      {
        sha: 'd'.repeat(40),
        message: 'Initial commit',
        author: 'Developer',
        timestamp: new Date(),
        files: ['README.md'],
      },
    ],
  };

  t.true(isScarContext(validContext));
});

test('ScarContext integrity validation', (t) => {
  const validContext: ScarContext = {
    reason: 'Test healing',
    eventLog: [createEventLogEntry('test', {}, 'info')],
    previousScars: [createScarRecord('a'.repeat(40), 'b'.repeat(40), 'v1.0.0', 'test')],
    searchResults: [],
    metadata: { tag: 'test', narrative: 'test narrative' },
    llmOperations: [],
    gitHistory: [],
  };

  const result = validateScarContextIntegrity(validContext);
  t.true(result.isValid);
  t.is(result.errors.length, 0);

  // Test with invalid data
  const invalidContext = {
    ...validContext,
    reason: '', // Empty reason
    metadata: { tag: '', narrative: 'test' }, // Empty tag
    previousScars: [
      {
        start: 'short', // Invalid SHA
        end: 'also-short',
        tag: 'test',
        story: 'test',
        timestamp: new Date(),
      },
    ],
  };

  const invalidResult = validateScarContextIntegrity(invalidContext);
  t.false(invalidResult.isValid);
  t.true(invalidResult.errors.length > 0);
});

test('Helper functions', (t) => {
  const eventEntry = createEventLogEntry('test-op', { key: 'value' }, 'warning');
  t.true(isEventLogEntry(eventEntry));
  t.is(eventEntry.operation, 'test-op');
  t.is(eventEntry.severity, 'warning');

  const scarRecord = createScarRecord('a'.repeat(40), 'b'.repeat(40), 'v1.0.0', 'test story');
  t.true(isScarRecord(scarRecord));
  t.is(scarRecord.tag, 'v1.0.0');
  t.is(scarRecord.story, 'test story');
});
