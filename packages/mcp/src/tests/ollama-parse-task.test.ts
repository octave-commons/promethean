import test from 'ava';

import { parseTask, isLeft, isRight } from '../ollama/index.js';

test('parseTask rejects invalid payloads', (t) => {
  const result = parseTask({ kind: 'generate' });
  t.true(isLeft(result));
  if (isLeft(result)) {
    t.truthy(result.value.issues);
  }
});

test('parseTask accepts generate tasks', (t) => {
  const input = {
    id: 'd8d0f1a0-82b5-42a7-96c3-7bb35b737cab',
    kind: 'generate' as const,
    model: 'llama3',
    prompt: 'Hello world',
  };
  const result = parseTask(input);
  t.true(isRight(result));
  if (isRight(result)) {
    t.is(result.value.kind, 'generate');
    if (result.value.kind === 'generate') {
      t.is(result.value.prompt, input.prompt);
    }
  }
});
