import test from 'ava';
import type { ToolPort, ContextPort, ActorPort, LlmPort } from '../../core/ports.js';

// Mock implementations for testing
const createMockToolPort = (): ToolPort => ({
  execute: async (command: string, args?: Record<string, unknown>) => {
    return { command, args, result: 'mock_result' };
  },
});

const createMockContextPort = (): ContextPort => ({
  compile: async (_sources: string[], _text: string) => ({
    id: 'mock-context',
    sources: _sources,
    text: _text,
    compiled: { processed: true },
    timestamp: Date.now(),
  }),
  get: async (_id: string) =>
    _id === 'existing'
      ? {
          id: _id,
          sources: ['source1'],
          text: 'Existing context',
          compiled: { cached: true },
          timestamp: Date.now(),
        }
      : null,
  save: async (_context) => {
    // Mock save operation
  },
});

const createMockActorPort = (): ActorPort => ({
  tick: async (_actorId: string) => {
    // Mock tick operation
  },
  create: async (_config) => `actor-${Date.now()}`,
  get: async (id: string) =>
    id === 'existing'
      ? {
          id,
          config: { name: 'test', type: 'tool', parameters: {} },
          state: 'running',
          lastTick: Date.now(),
        }
      : null,
});

const createMockLlmPort = (): LlmPort => ({
  complete: async (messages, _opts) => ({
    role: 'assistant',
    content: `Mock response to ${messages.length} messages`,
  }),
});

test('ToolPort execute method', async (t) => {
  const toolPort = createMockToolPort();

  const result = await toolPort.execute('test-command', { param: 'value' });

  t.deepEqual(result, {
    command: 'test-command',
    args: { param: 'value' },
    result: 'mock_result',
  });
});

test('ToolPort execute without args', async (t) => {
  const toolPort = createMockToolPort();

  const result = await toolPort.execute('simple-command');

  t.deepEqual(result, {
    command: 'simple-command',
    args: undefined,
    result: 'mock_result',
  });
});

test('ContextPort compile method', async (t) => {
  const contextPort = createMockContextPort();

  const result = await contextPort.compile(['source1', 'source2'], 'Test text');

  t.is(result.id, 'mock-context');
  t.deepEqual(result.sources, ['source1', 'source2']);
  t.is(result.text, 'Test text');
  t.deepEqual(result.compiled, { processed: true });
  t.true(result.timestamp > 0);
});

test('ContextPort get existing context', async (t) => {
  const contextPort = createMockContextPort();

  const result = await contextPort.get('existing');

  t.not(result, null);
  t.is(result?.id, 'existing');
  t.deepEqual(result?.sources, ['source1']);
  t.is(result?.text, 'Existing context');
  t.deepEqual(result?.compiled, { cached: true });
});

test('ContextPort get non-existing context', async (t) => {
  const contextPort = createMockContextPort();

  const result = await contextPort.get('non-existing');

  t.is(result, null);
});

test('ContextPort save method', async (t) => {
  const contextPort = createMockContextPort();

  const context = {
    id: 'test-context',
    sources: ['source1'],
    text: 'Test context',
    compiled: { data: 'test' },
    timestamp: Date.now(),
  };

  await t.notThrowsAsync(() => contextPort.save(context));
});

test('ActorPort create method', async (t) => {
  const actorPort = createMockActorPort();

  const config = {
    name: 'test-actor',
    type: 'llm' as const,
    parameters: { model: 'gpt-4' },
  };

  const actorId = await actorPort.create(config);

  t.is(typeof actorId, 'string');
  t.true(actorId.startsWith('actor-'));
});

test('ActorPort get existing actor', async (t) => {
  const actorPort = createMockActorPort();

  const result = await actorPort.get('existing');

  t.not(result, null);
  t.is(result?.id, 'existing');
  t.is(result?.config.name, 'test');
  t.is(result?.config.type, 'tool');
  t.is(result?.state, 'running');
  t.true((result?.lastTick ?? 0) > 0);
});

test('ActorPort get non-existing actor', async (t) => {
  const actorPort = createMockActorPort();

  const result = await actorPort.get('non-existing');

  t.is(result, null);
});

test('ActorPort tick method', async (t) => {
  const actorPort = createMockActorPort();

  await t.notThrowsAsync(() => actorPort.tick('actor-id'));
});

test('LlmPort complete method', async (t) => {
  const llmPort = createMockLlmPort();

  const messages = [
    { role: 'user' as const, content: 'Hello' },
    { role: 'assistant' as const, content: 'Hi there!' },
  ];

  const result = await llmPort.complete(messages, { model: 'gpt-4', temperature: 0.7 });

  t.is(result.role, 'assistant');
  t.true(result.content.includes('2 messages'));
});

test('LlmPort complete without options', async (t) => {
  const llmPort = createMockLlmPort();

  const messages = [{ role: 'user' as const, content: 'Test' }];

  const result = await llmPort.complete(messages);

  t.is(result.role, 'assistant');
  t.true(result.content.includes('1 messages'));
});
