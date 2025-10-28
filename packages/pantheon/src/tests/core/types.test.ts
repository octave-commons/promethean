import test from 'ava';
import type { Actor, ActorConfig, Context, Message } from '../../core/types.js';

test('ActorConfig interface validation', (t) => {
  const validConfig: ActorConfig = {
    name: 'test-actor',
    type: 'llm',
    parameters: { model: 'gpt-4' },
  };

  t.is(validConfig.name, 'test-actor');
  t.is(validConfig.type, 'llm');
  t.deepEqual(validConfig.parameters, { model: 'gpt-4' });
});

test('Actor interface validation', (t) => {
  const config: ActorConfig = {
    name: 'test-actor',
    type: 'tool',
    parameters: {},
  };

  const actor: Actor = {
    id: 'actor-123',
    config,
    state: 'running',
    lastTick: Date.now(),
  };

  t.is(actor.id, 'actor-123');
  t.deepEqual(actor.config, config);
  t.is(actor.state, 'running');
  t.true(actor.lastTick > 0);
});

test('Context interface validation', (t) => {
  const context: Context = {
    id: 'context-456',
    sources: ['source1', 'source2'],
    text: 'Sample context text',
    compiled: { processed: true },
    timestamp: Date.now(),
  };

  t.is(context.id, 'context-456');
  t.deepEqual(context.sources, ['source1', 'source2']);
  t.is(context.text, 'Sample context text');
  t.deepEqual(context.compiled, { processed: true });
  t.true(context.timestamp > 0);
});

test('Message interface validation', (t) => {
  const message: Message = {
    id: 'message-789',
    type: 'user',
    content: 'Hello world',
    timestamp: Date.now(),
  };

  t.is(message.id, 'message-789');
  t.is(message.type, 'user');
  t.is(message.content, 'Hello world');
  t.true(message.timestamp > 0);
});

test('Actor type validation', (t) => {
  const validTypes: ActorConfig['type'][] = ['llm', 'tool', 'composite'];

  validTypes.forEach((type) => {
    const config: ActorConfig = {
      name: `test-${type}`,
      type,
      parameters: {},
    };
    t.is(config.type, type);
  });
});

test('Actor state validation', (t) => {
  const validStates = ['running', 'idle', 'completed', 'failed'];

  validStates.forEach((state) => {
    const actor: Actor = {
      id: 'actor-test',
      config: { name: 'test', type: 'tool', parameters: {} },
      state,
      lastTick: Date.now(),
    };
    t.is(actor.state, state);
  });
});
