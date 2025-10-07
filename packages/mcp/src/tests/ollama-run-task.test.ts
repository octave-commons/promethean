import test from 'ava';

import { parseTask, isRight, runTask, type TaskStreamEvent } from '../ollama/index.js';

async function collectStream(iterable: AsyncIterable<TaskStreamEvent>): Promise<TaskStreamEvent[]> {
  const acc: TaskStreamEvent[] = [];
  for await (const chunk of iterable) {
    acc.push(chunk);
  }
  return acc;
}

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

  const run = await runTask(parsed.value, {
    fetch: fakeFetch,
    baseUrl: 'http://localhost:11434',
    now: () => timestamps.shift() ?? new Date('2025-01-01T00:00:02.000Z'),
  });

  const streamPromise = collectStream(run.stream);
  const outcome = await run.result;
  const chunks = await streamPromise;

  if (outcome.kind !== 'Success') {
    t.fail(`expected success, received ${outcome.kind}`);
    return;
  }
  const { result } = outcome;
  t.is(result.status, 'succeeded');
  t.is(result.id, parsed.value.id);
  t.is(result.startedAt, '2025-01-01T00:00:00.000Z');
  t.is(result.finishedAt, '2025-01-01T00:00:01.000Z');
  t.deepEqual(result.output.data, payload);
  t.deepEqual(result.output.logs, [JSON.stringify(payload)]);
  t.deepEqual(
    chunks.map((chunk) => chunk.raw),
    [JSON.stringify(payload)],
  );
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
    t.true(init?.signal instanceof AbortSignal);
    return new Response(stream, {
      headers: { 'content-type': 'text/plain' },
      status: 200,
    });
  };

  const runPromise = runTask(
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

  const run = await runPromise;
  const [outcome, chunks] = await Promise.all([run.result, collectStream(run.stream)]);

  t.is(outcome.kind, 'Timeout');
  t.deepEqual(
    chunks.map((chunk) => chunk.raw),
    ['partial-'],
  );
});

test('runTask parses SSE payloads and yields deltas', async (t) => {
  const parsed = parseTask({
    id: '9709f990-bc6b-44fa-85b1-4a968da1c17a',
    kind: 'chat',
    model: 'llama3',
    messages: [{ role: 'user', content: 'hi' }],
  });
  if (!isRight(parsed)) {
    t.fail('parseTask should succeed');
    return;
  }

  const payload = [
    'data:{"message":{"content":"Hello"},"done":false}\n\n',
    'data:{"done":true,"prompt_eval_count":5,"eval_count":7,"total_duration":2000000}\n\n',
  ];

  const stream = new ReadableStream<Uint8Array>({
    start(controllerStream) {
      payload.forEach((chunk) => controllerStream.enqueue(new TextEncoder().encode(chunk)));
      controllerStream.close();
    },
  });

  const fakeFetch: typeof fetch = async () =>
    new Response(stream, {
      headers: { 'content-type': 'text/event-stream' },
      status: 200,
    });

  const run = await runTask(parsed.value, {
    fetch: fakeFetch,
    baseUrl: 'http://localhost:11434',
    now: () => new Date('2025-01-01T00:00:00.000Z'),
  });

  const [outcome, chunks] = await Promise.all([run.result, collectStream(run.stream)]);

  if (outcome.kind !== 'Success') {
    t.fail(`expected success, received ${outcome.kind}`);
    return;
  }
  t.deepEqual(
    chunks.map((chunk) => ({ raw: chunk.raw, text: chunk.textDelta, done: chunk.done })),
    [
      {
        raw: '{"message":{"content":"Hello"},"done":false}',
        text: 'Hello',
        done: false,
      },
      {
        raw: '{"done":true,"prompt_eval_count":5,"eval_count":7,"total_duration":2000000}',
        text: undefined,
        done: true,
      },
    ],
  );
});

test('runTask surfaces rate limiting metadata', async (t) => {
  const parsed = parseTask({
    id: 'ec4f4af6-9067-4bc2-92ea-3d56d5c3b718',
    kind: 'generate',
    model: 'llama3',
    prompt: 'hello',
  });
  if (!isRight(parsed)) {
    t.fail('parseTask should succeed');
    return;
  }

  const fakeFetch: typeof fetch = async () =>
    new Response('busy', {
      status: 429,
      headers: { 'retry-after': '3' },
    });

  const run = await runTask(parsed.value, {
    fetch: fakeFetch,
    baseUrl: 'http://localhost:11434',
    now: () => new Date('2025-01-01T00:00:00.000Z'),
  });

  const outcome = await run.result;
  if (outcome.kind !== 'RateLimited') {
    t.fail(`expected rate limited, received ${outcome.kind}`);
    return;
  }
  t.is(outcome.retryAfterMs, 3000);
});

test('runTask honours timeoutMs option', async (t) => {
  const parsed = parseTask({
    id: '68b5ee81-12a3-4fa6-9a8e-9d39d0de8d88',
    kind: 'chat',
    model: 'llama3',
    messages: [{ role: 'user', content: 'ping' }],
  });
  if (!isRight(parsed)) {
    t.fail('parseTask should succeed');
    return;
  }

  const fakeFetch: typeof fetch = async (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const err = new Error('The operation was aborted.');
        // eslint-disable-next-line functional/immutable-data
        (err as { name: string }).name = 'AbortError';
        reject(err);
      });
    });

  const run = await runTask(
    parsed.value,
    {
      fetch: fakeFetch,
      baseUrl: 'http://localhost:11434',
      now: () => new Date('2025-01-01T00:00:00.000Z'),
    },
    { timeoutMs: 5 },
  );

  const outcome = await run.result;
  t.is(outcome.kind, 'Timeout');
});

test('runTask reports debug metrics when requested', async (t) => {
  const parsed = parseTask({
    id: '2cf764e9-6e94-4d55-90be-7f4f3f5fe414',
    kind: 'chat',
    model: 'llama3',
    messages: [{ role: 'user', content: 'hi' }],
  });
  if (!isRight(parsed)) {
    t.fail('parseTask should succeed');
    return;
  }

  const text =
    '{"message":{"content":"Hello"},"done":false,"prompt_eval_count":4,"eval_count":6}\n' +
    '{"done":true,"prompt_eval_count":4,"eval_count":6,"total_duration":5000000}\n';

  const fakeFetch: typeof fetch = async () =>
    new Response(text, {
      headers: { 'content-type': 'application/x-ndjson' },
      status: 200,
    });

  const run = await runTask(
    parsed.value,
    {
      fetch: fakeFetch,
      baseUrl: 'http://localhost:11434',
      now: () => new Date('2025-01-01T00:00:00.000Z'),
    },
    { debug: true },
  );

  const outcome = await run.result;
  if (outcome.kind !== 'Success') {
    t.fail(`expected success, received ${outcome.kind}`);
    return;
  }
  t.deepEqual(outcome.debug, { tokensIn: 4, tokensOut: 6, durationMs: 5 });
});
