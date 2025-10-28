import test from 'ava';
import type { Actor, ActorConfig } from '../../core/types.js';

test('Actor interface validation', (t) => {
  const config: ActorConfig = {
    name: 'test-actor',
    type: 'llm',
    parameters: { model: 'gpt-4', temperature: 0.7 },
  };

  const actor: Actor = {
    id: 'actor-12345',
    config,
    state: 'running',
    lastTick: Date.now(),
  };

  t.is(actor.id, 'actor-12345');
  t.deepEqual(actor.config, config);
  t.is(actor.state, 'running');
  t.true(actor.lastTick > 0);
});

test('Actor with different states', (t) => {
  const config: ActorConfig = {
    name: 'state-test-actor',
    type: 'tool',
    parameters: {},
  };

  const states: Actor['state'][] = ['running', 'idle', 'completed', 'failed'];

  states.forEach((state) => {
    const actor: Actor = {
      id: `actor-${state}`,
      config,
      state,
      lastTick: Date.now(),
    };

    t.is(actor.state, state);
  });
});

test('Actor with LLM type configuration', (t) => {
  const config: ActorConfig = {
    name: 'llm-actor',
    type: 'llm',
    parameters: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful assistant.',
    },
  };

  const actor: Actor = {
    id: 'llm-actor-123',
    config,
    state: 'idle',
    lastTick: Date.now(),
  };

  t.is(actor.config.type, 'llm');
  t.is(actor.config.parameters.model, 'gpt-4');
  t.is(actor.config.parameters.temperature, 0.7);
  t.is(actor.config.parameters.maxTokens, 2000);
  t.is(actor.config.parameters.systemPrompt, 'You are a helpful assistant.');
});

test('Actor with Tool type configuration', (t) => {
  const config: ActorConfig = {
    name: 'tool-actor',
    type: 'tool',
    parameters: {
      tools: [
        { name: 'calculator', description: 'Performs calculations' },
        { name: 'weather', description: 'Gets weather information' },
      ],
      timeout: 30000,
    },
  };

  const actor: Actor = {
    id: 'tool-actor-456',
    config,
    state: 'running',
    lastTick: Date.now(),
  };

  t.is(actor.config.type, 'tool');
  t.deepEqual(actor.config.parameters.tools, [
    { name: 'calculator', description: 'Performs calculations' },
    { name: 'weather', description: 'Gets weather information' },
  ]);
  t.is(actor.config.parameters.timeout, 30000);
});

test('Actor with Composite type configuration', (t) => {
  const config: ActorConfig = {
    name: 'composite-actor',
    type: 'composite',
    parameters: {
      actors: ['llm-actor-1', 'tool-actor-1'],
      coordination: 'sequential',
      fallbackEnabled: true,
    },
  };

  const actor: Actor = {
    id: 'composite-actor-789',
    config,
    state: 'idle',
    lastTick: Date.now(),
  };

  t.is(actor.config.type, 'composite');
  t.deepEqual(actor.config.parameters.actors, ['llm-actor-1', 'tool-actor-1']);
  t.is(actor.config.parameters.coordination, 'sequential');
  t.true(actor.config.parameters.fallbackEnabled);
});

test('Actor timestamp validation', (t) => {
  const now = Date.now();
  const config: ActorConfig = {
    name: 'timestamp-actor',
    type: 'tool',
    parameters: {},
  };

  const actor: Actor = {
    id: 'timestamp-actor-123',
    config,
    state: 'running',
    lastTick: now,
  };

  t.is(actor.lastTick, now);
  t.is(typeof actor.lastTick, 'number');
  t.true(Number.isInteger(actor.lastTick));
  t.true(actor.lastTick > 0);
});

test('Actor with minimal configuration', (t) => {
  const config: ActorConfig = {
    name: 'minimal-actor',
    type: 'tool',
    parameters: {},
  };

  const actor: Actor = {
    id: 'minimal-actor-1',
    config,
    state: 'idle',
    lastTick: Date.now(),
  };

  t.is(actor.config.name, 'minimal-actor');
  t.deepEqual(actor.config.parameters, {});
  t.is(actor.state, 'idle');
});
