import test from 'ava';

import { createContextSource, mergeContextSources, truncateMessages } from '../../utils/index.js';

test('createContextSource creates valid context source', (t) => {
  const source = createContextSource('test-id', 'Test Label', { key: 'value' }, { meta: 'data' });

  t.is(source.id, 'test-id');
  t.is(source.label, 'Test Label');
  t.deepEqual(source.where, { key: 'value' });
  t.deepEqual(source.metadata, { meta: 'data' });
});

test('createContextSource with minimal parameters', (t) => {
  const source = createContextSource('minimal-id', 'Minimal Label');

  t.is(source.id, 'minimal-id');
  t.is(source.label, 'Minimal Label');
  t.is(source.where, undefined);
  t.is(source.metadata, undefined);
});

test('mergeContextSources removes duplicates', (t) => {
  const source1 = createContextSource('source-1', 'Source 1');
  const source2 = createContextSource('source-2', 'Source 2');
  const source3 = createContextSource('source-1', 'Source 1 Duplicate'); // Same ID as source1

  const merged = mergeContextSources([source1], [source2, source3]);

  t.is(merged.length, 2);
  t.is(merged[0]?.id, 'source-1');
  t.is(merged[1]?.id, 'source-2');
});

test('mergeContextSources preserves order', (t) => {
  const source1 = createContextSource('source-1', 'Source 1');
  const source2 = createContextSource('source-2', 'Source 2');
  const source3 = createContextSource('source-3', 'Source 3');

  const merged = mergeContextSources([source1, source2], [source3]);

  t.is(merged.length, 3);
  t.is(merged[0]?.id, 'source-1');
  t.is(merged[1]?.id, 'source-2');
  t.is(merged[2]?.id, 'source-3');
});

test('mergeContextSources with empty arrays', (t) => {
  const source1 = createContextSource('source-1', 'Source 1');

  const merged1 = mergeContextSources([], [source1]);
  const merged2 = mergeContextSources([source1], []);
  const merged3 = mergeContextSources([], []);

  t.is(merged1.length, 1);
  t.is(merged1[0]?.id, 'source-1');

  t.is(merged2.length, 1);
  t.is(merged2[0]?.id, 'source-1');

  t.is(merged3.length, 0);
});

test('truncateMessages keeps recent messages', (t) => {
  const messages = [
    { role: 'system' as const, content: 'System message' },
    { role: 'user' as const, content: 'User message 1' },
    { role: 'assistant' as const, content: 'Assistant response 1' },
    { role: 'user' as const, content: 'User message 2' },
    { role: 'assistant' as const, content: 'Assistant response 2' },
  ];

  const truncated = truncateMessages(messages, 100, 0.25); // 100 tokens = 400 chars

  t.is(truncated.length, 5); // All messages should fit
  t.deepEqual(truncated, messages);
});

test('truncateMessages with token limit', (t) => {
  const messages = [
    { role: 'system' as const, content: 'System message' },
    { role: 'user' as const, content: 'User message 1' },
    { role: 'assistant' as const, content: 'Assistant response 1' },
    { role: 'user' as const, content: 'User message 2' },
    { role: 'assistant' as const, content: 'Assistant response 2' },
  ];

  const truncated = truncateMessages(messages, 20, 0.25); // 20 tokens = 80 chars

  t.true(truncated.length < messages.length);
  t.true(truncated.length > 0);
});

test('truncateMessages with partial message', (t) => {
  const longMessage = 'a'.repeat(200);
  const messages = [
    { role: 'user' as const, content: 'Short message' },
    { role: 'assistant' as const, content: longMessage },
  ];

  const truncated = truncateMessages(messages, 30, 0.25); // 30 tokens = 120 chars

  t.is(truncated.length, 1);
  if (truncated[0]) {
    t.true(truncated[0].content.includes('...[truncated]'));
    t.true(truncated[0].content.length < longMessage.length);
  }
});

test('truncateMessages with empty array', (t) => {
  const truncated = truncateMessages([], 100);

  t.is(truncated.length, 0);
  t.deepEqual(truncated, []);
});

test('truncateMessages default parameters', (t) => {
  const messages = [{ role: 'user' as const, content: 'Test message' }];

  const truncated = truncateMessages(messages);

  t.is(truncated.length, 1);
  t.deepEqual(truncated, messages);
});
