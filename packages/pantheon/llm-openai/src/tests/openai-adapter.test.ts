import test from 'ava';
import { makeOpenAIAdapter, OpenAIAdapterError } from '../index.js';
import type { LlmPort, Message } from '@promethean-os/pantheon-core';

// Mock OpenAI client for testing
const createMockOpenAI = (responses: any[], shouldFail = false, errorType?: string) => ({
  chat: {
    completions: {
      create: async () => {
        if (shouldFail) {
          const error = new Error(errorType || 'API error');
          throw error;
        }
        return responses.shift();
      },
    },
  },
});

test('OpenAI adapter validates API key', async (t) => {
  const error = t.throws(() => {
    makeOpenAIAdapter({ apiKey: '' });
  });

  t.true(error instanceof OpenAIAdapterError);
  t.true(error.message.includes('API key is required'));
});

test('OpenAI adapter validates configuration', async (t) => {
  const config = {
    apiKey: 'test-key',
    defaultTemperature: 3, // Invalid: > 2
    defaultMaxTokens: -1, // Invalid: not positive
  };

  const error = t.throws(() => {
    makeOpenAIAdapter(config);
  });

  t.true(error instanceof OpenAIAdapterError);
});

test('OpenAI adapter validates messages', async (t) => {
  const adapter = makeOpenAIAdapter({ apiKey: 'test-key' });

  const error = await t.throwsAsync(async () => {
    await adapter.complete([]);
  });

  t.true(error instanceof OpenAIAdapterError);
  t.true(error.message.includes('Messages array is required'));
});

test('OpenAI adapter validates message content', async (t) => {
  const adapter = makeOpenAIAdapter({ apiKey: 'test-key' });

  const error = await t.throwsAsync(async () => {
    await adapter.complete([{ role: 'user', content: '' }]);
  });

  t.true(error instanceof OpenAIAdapterError);
  t.true(error.message.includes('Message content cannot be empty'));
});

test('OpenAI adapter retries on rate limit errors', async (t) => {
  let attemptCount = 0;
  const mockClient = createMockOpenAI(
    [{ choices: [{ message: { content: 'Success' } }] }],
    true,
    'rate_limit_exceeded',
  );

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    retryConfig: { maxRetries: 2, baseDelay: 10 },
  });

  // Replace client with mock
  (adapter as any).client = mockClient;

  const error = await t.throwsAsync(async () => {
    await adapter.complete([{ role: 'user', content: 'test' }]);
  });

  t.true(error instanceof OpenAIAdapterError);
  t.true(error.message.includes('rate_limit_exceeded'));
});

test('OpenAI adapter succeeds after retries', async (t) => {
  let attemptCount = 0;
  const mockClient = createMockOpenAI(
    [{ choices: [{ message: { content: 'Success' } }] }],
    true, // Fail first attempt
    'temporary_error',
  );

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    retryConfig: { maxRetries: 2, baseDelay: 10 },
  });

  // Replace client with mock
  (adapter as any).client = mockClient;

  // Mock should succeed on second attempt after first failure
  const result = await adapter.complete([{ role: 'user', content: 'test' }]);

  t.is(result.content, 'Success');
});

test('OpenAI adapter handles timeout errors', async (t) => {
  const mockClient = createMockOpenAI([], true, 'timeout');

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    timeout: 1000,
  });

  // Replace client with mock
  (adapter as any).client = mockClient;

  const error = await t.throwsAsync(async () => {
    await adapter.complete([{ role: 'user', content: 'test' }]);
  });

  t.true(error instanceof OpenAIAdapterError);
  t.true(error.message.includes('timeout'));
});

test('OpenAI adapter uses default configuration', async (t) => {
  const mockClient = createMockOpenAI([
    { choices: [{ message: { content: 'Default response' } }] },
  ]);

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    defaultModel: 'gpt-4',
    defaultTemperature: 0.5,
    defaultMaxTokens: 1000,
  });

  // Replace client with mock
  (adapter as any).client = mockClient;

  const result = await adapter.complete([{ role: 'user', content: 'test' }]);

  t.is(result.content, 'Default response');
});

test('OpenAI adapter merges options with defaults', async (t) => {
  const mockClient = createMockOpenAI([{ choices: [{ message: { content: 'Custom response' } }] }]);

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    defaultModel: 'gpt-3.5-turbo',
    defaultTemperature: 0.7,
    defaultMaxTokens: 500,
  });

  // Replace client with mock
  (adapter as any).client = mockClient;

  const result = await adapter.complete([{ role: 'user', content: 'test' }], {
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 2000,
  });

  t.is(result.content, 'Custom response');
});

test('OpenAI adapter handles malformed responses', async (t) => {
  const mockClient = createMockOpenAI([
    { choices: [] }, // Empty choices
  ]);

  const adapter = makeOpenAIAdapter({ apiKey: 'test-key' });

  // Replace client with mock
  (adapter as any).client = mockClient;

  const error = await t.throwsAsync(async () => {
    await adapter.complete([{ role: 'user', content: 'test' }]);
  });

  t.true(error instanceof OpenAIAdapterError);
  t.true(error.message.includes('No response from OpenAI'));
});

test('OpenAI adapter validates completion options', async (t) => {
  const adapter = makeOpenAIAdapter({ apiKey: 'test-key' });

  const error = await t.throwsAsync(async () => {
    await adapter.complete([{ role: 'user', content: 'test' }], {
      temperature: 3, // Invalid: > 2
    });
  });

  t.true(error instanceof OpenAIAdapterError);
});

test('OpenAI adapter exponential backoff increases delay', async (t) => {
  const delays: number[] = [];
  const originalSetTimeout = global.setTimeout;

  global.setTimeout = (callback: Function, delay: number) => {
    delays.push(delay);
    return originalSetTimeout(callback, delay);
  };

  const mockClient = createMockOpenAI(
    [{ choices: [{ message: { content: 'Success' } }] }],
    true, // Fail first 2 attempts
    'temporary_error',
  );

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    retryConfig: { maxRetries: 2, baseDelay: 100, backoffMultiplier: 2 },
  });

  // Replace client with mock
  (adapter as any).client = mockClient;

  await adapter.complete([{ role: 'user', content: 'test' }]);

  // Should have delays: 100, 200 (with jitter)
  t.true(delays.length >= 2);
  t.true(delays[0] >= 100);
  t.true(delays[1] >= 200);

  // Restore original setTimeout
  global.setTimeout = originalSetTimeout;
});
