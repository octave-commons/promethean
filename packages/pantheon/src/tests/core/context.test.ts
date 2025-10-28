import test from 'ava';
import type { Context } from '../../core/types.js';

test('Context interface validation', (t) => {
  const context: Context = {
    id: 'test-context-123',
    sources: ['source1', 'source2', 'source3'],
    text: 'This is test context content',
    compiled: { processed: true, data: 'compiled-data' },
    timestamp: Date.now(),
  };

  t.is(context.id, 'test-context-123');
  t.deepEqual(context.sources, ['source1', 'source2', 'source3']);
  t.is(context.text, 'This is test context content');
  t.deepEqual(context.compiled, { processed: true, data: 'compiled-data' });
  t.true(context.timestamp > 0);
});

test('Context with minimal data', (t) => {
  const context: Context = {
    id: 'minimal-context',
    sources: [],
    text: '',
    compiled: null,
    timestamp: 1234567890,
  };

  t.is(context.id, 'minimal-context');
  t.deepEqual(context.sources, []);
  t.is(context.text, '');
  t.is(context.compiled, null);
  t.is(context.timestamp, 1234567890);
});

test('Context with complex compiled data', (t) => {
  const complexCompiled = {
    metadata: { version: '1.0', author: 'test' },
    processed: true,
    tokens: 150,
    embeddings: [0.1, 0.2, 0.3],
  };

  const context: Context = {
    id: 'complex-context',
    sources: ['document.pdf', 'webpage.html'],
    text: 'Complex context with rich compiled data',
    compiled: complexCompiled,
    timestamp: Date.now(),
  };

  t.deepEqual(context.compiled, complexCompiled);
  const compiled = context.compiled as {
    metadata: { version: string };
    tokens: number;
    embeddings: number[];
  };
  if (compiled) {
    t.is(compiled.metadata.version, '1.0');
    t.is(compiled.tokens, 150);
    t.deepEqual(compiled.embeddings, [0.1, 0.2, 0.3]);
  }
});

test('Context timestamp validation', (t) => {
  const now = Date.now();
  const context: Context = {
    id: 'timestamp-test',
    sources: ['test'],
    text: 'Testing timestamp',
    compiled: {},
    timestamp: now,
  };

  t.is(context.timestamp, now);

  // Test that timestamp is a valid number
  t.is(typeof context.timestamp, 'number');
  t.true(Number.isInteger(context.timestamp));
  t.true(context.timestamp > 0);
});

test('Context sources array validation', (t) => {
  const sources = ['file1.txt', 'file2.txt', 'api-endpoint', 'database'];
  const context: Context = {
    id: 'sources-test',
    sources,
    text: 'Testing sources array',
    compiled: { sourceCount: sources.length },
    timestamp: Date.now(),
  };

  t.deepEqual(context.sources, sources);
  t.is(context.sources.length, 4);
  t.true(Array.isArray(context.sources));

  // Verify all sources are strings
  context.sources.forEach((source) => {
    t.is(typeof source, 'string');
    t.true(source.length > 0);
  });
});
