import test from 'ava';

import { parseTask, isRight, runTask } from '../index.js';

test('runTask posts to Ollama and returns structured success', async (t) => {
  const parsed = parseTask({
    id: '9b2d9f87-6e8e-4a1a-bc3d-a58fa4899096',
    kind: 'generate',
    model: 'llama3',
    prompt: 'ping',
  });
  if (!isRight(parsed)) {
    t.fail('parseTask should succeed');
    return;
  }

  const timestamps = [new Date('2025-01-01T00:00:00.000Z'), new Date('2025-01-01T00:00:01.000Z')];

  const payload = { response: 'pong' };
  const fakeFetch: typeof fetch = async (input, init) => {
    t.is(new URL(input as string).pathname, '/api/generate');
    t.is(init?.method, 'POST');
    const body = JSON.parse(init?.body as string);
    t.is(body.model, 'llama3');
    t.is(body.prompt, 'ping');
    return new Response(JSON.stringify(payload), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
  };

  const result = await runTask(parsed.value, {
    fetch: fakeFetch,
    baseUrl: 'http://localhost:11434',
    now: () => timestamps.shift() ?? new Date('2025-01-01T00:00:02.000Z'),
  });

  t.is(result.status, 'succeeded');
  t.is(result.id, parsed.value.id);
  t.is(result.startedAt, '2025-01-01T00:00:00.000Z');
  t.is(result.finishedAt, '2025-01-01T00:00:01.000Z');
  t.deepEqual(result.output.data, payload);
  t.deepEqual(result.output.logs, [JSON.stringify(payload)]);
});

test('runTask respects AbortSignal and returns partial logs', async (t) => {
  const parsed = parseTask({
    id: 'f1d89356-0fe0-4f59-b62b-f89f5f703c7a',
    kind: 'generate',
    model: 'llama3',
    prompt: 'stream',
  });
  if (!isRight(parsed)) {
    t.fail('parseTask should succeed');
    return;
  }

  const controller = new AbortController();
  const encoder = new TextEncoder();
  const times = [new Date('2025-01-01T00:00:00.000Z'), new Date('2025-01-01T00:00:01.000Z')];

  const stream = new ReadableStream<Uint8Array>({
    start(controllerStream) {
      controllerStream.enqueue(encoder.encode('partial-'));
      setTimeout(() => {
        if (controller.signal.aborted) {
          return;
        }
        controllerStream.enqueue(encoder.encode('complete'));
        controllerStream.close();
      }, 20);
    },
  });

  const fakeFetch: typeof fetch = async (_input, init) => {
    t.is(init?.signal, controller.signal);
    return new Response(stream, {
      headers: { 'content-type': 'text/plain' },
      status: 200,
    });
  };

  const promise = runTask(
    parsed.value,
    {
      fetch: fakeFetch,
      baseUrl: 'http://localhost:11434',
      now: () => times.shift() ?? new Date('2025-01-01T00:00:02.000Z'),
    },
    { signal: controller.signal },
  );

  await new Promise((resolve) => setTimeout(resolve, 5));
  controller.abort();

  const result = await promise;
  t.is(result.status, 'aborted');
  t.deepEqual(result.output.logs, ['partial-']);
  t.is(result.output.error, 'aborted');
});
