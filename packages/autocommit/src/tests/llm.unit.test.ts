import test from 'ava';

import { chatCompletion, createSafeHeaders, type ChatCompletionOptions } from '../llm.ts';

// Mock fetch to control responses
function createMockResponse(ok: boolean, status: number, content: unknown) {
  return {
    ok,
    status,
    text: () => Promise.resolve(String(content)),
    json: () => Promise.resolve(content),
  } as Response;
}

const mockFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (url.includes('invalid-url')) {
    throw new TypeError('fetch failed');
  }

  if (
    init?.headers &&
    (init.headers as Record<string, string>)?.Authorization?.includes('invalid-key')
  ) {
    return Promise.resolve(createMockResponse(false, 401, 'Unauthorized: invalid api_key'));
  }

  if (url.includes('server-error')) {
    return Promise.resolve(createMockResponse(false, 500, 'Internal server error'));
  }

  if (url.includes('empty-response')) {
    return Promise.resolve(
      createMockResponse(true, 200, { choices: [{ message: { content: '' } }] }),
    );
  }

  if (url.includes('invalid-response')) {
    return Promise.resolve(createMockResponse(true, 200, { invalid: 'response' }));
  }

  // Valid response
  return Promise.resolve(
    createMockResponse(true, 200, {
      choices: [{ message: { content: 'Generated commit message' } }],
    }),
  );
};

// Override global fetch for testing
const originalFetch = global.fetch;
test.before(() => {
  global.fetch = mockFetch;
});

test.after(() => {
  global.fetch = originalFetch;
});

test('createSafeHeaders creates correct headers without API key', (t) => {
  const headers = createSafeHeaders();
  t.deepEqual(headers, {
    'Content-Type': 'application/json',
  });
});

test('createSafeHeaders creates correct headers with API key', (t) => {
  const headers = createSafeHeaders('test-api-key-123');
  t.deepEqual(headers, {
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-api-key-123',
  });
});

test('createSafeHeaders throws error for invalid API key', (t) => {
  t.throws(() => createSafeHeaders('invalid@key#'), {
    message: 'Invalid API key format',
  });
});

test('chatCompletion throws error for invalid options', async (t) => {
  await t.throwsAsync(chatCompletion({} as ChatCompletionOptions), {
    message: 'Invalid chat completion options',
  });
});

test('chatCompletion throws error for network failure', async (t) => {
  await t.throwsAsync(
    chatCompletion({
      baseUrl: 'http://invalid-url',
      model: 'test',
      temperature: 0.2,
      messages: [{ role: 'user', content: 'test' }],
    }),
    { message: 'Unexpected error during LLM request: TypeError: fetch failed' },
  );
});

test('chatCompletion throws error for authentication failure', async (t) => {
  await t.throwsAsync(
    chatCompletion({
      baseUrl: 'http://example.com/v1',
      apiKey: 'invalid-key',
      model: 'test',
      temperature: 0.2,
      messages: [{ role: 'user', content: 'test' }],
    }),
    { message: 'LLM error 401: Authentication failed' },
  );
});

test('chatCompletion throws error for server error', async (t) => {
  await t.throwsAsync(
    chatCompletion({
      baseUrl: 'http://example.com/server-error',
      model: 'test',
      temperature: 0.2,
      messages: [{ role: 'user', content: 'test' }],
    }),
    { message: 'LLM error 500: Internal server error' },
  );
});

test('chatCompletion throws error for empty response', async (t) => {
  await t.throwsAsync(
    chatCompletion({
      baseUrl: 'http://example.com/empty-response',
      model: 'test',
      temperature: 0.2,
      messages: [{ role: 'user', content: 'test' }],
    }),
    { message: 'Empty or invalid LLM response' },
  );
});

test('chatCompletion throws error for invalid response structure', async (t) => {
  await t.throwsAsync(
    chatCompletion({
      baseUrl: 'http://example.com/invalid-response',
      model: 'test',
      temperature: 0.2,
      messages: [{ role: 'user', content: 'test' }],
    }),
    { message: 'Empty or invalid LLM response' },
  );
});

test('chatCompletion returns content for valid response', async (t) => {
  const result = await chatCompletion({
    baseUrl: 'http://example.com/v1',
    model: 'test',
    temperature: 0.2,
    messages: [{ role: 'user', content: 'test' }],
  });

  t.is(result, 'Generated commit message');
});

test('chatCompletion works without API key', async (t) => {
  const result = await chatCompletion({
    baseUrl: 'http://example.com/v1',
    model: 'test',
    temperature: 0.2,
    messages: [{ role: 'user', content: 'test' }],
  });

  t.is(result, 'Generated commit message');
});

test('chatCompletion sanitizes URL by removing trailing slashes', async (t) => {
  const result = await chatCompletion({
    baseUrl: 'http://example.com/v1///',
    model: 'test',
    temperature: 0.2,
    messages: [{ role: 'user', content: 'test' }],
  });

  t.is(result, 'Generated commit message');
});
