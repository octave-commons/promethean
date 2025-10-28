import test from 'ava';

import { makeOrchestrator } from '../../core/orchestrator.js';
import type { OrchestratorDeps } from '../../core/orchestrator.js';
import type { ActorConfig, Context } from '../../core/types.js';

// Mock implementations
const createMockToolPort = () => ({
  execute: async (command: string, args?: Record<string, unknown>) => {
    return { command, args, executed: true };
  },
});

const createMockContextPort = () => ({
  compile: async (sources: string[], text: string): Promise<Context> => ({
    id: 'test-context',
    sources,
    text,
    compiled: { processed: true },
    timestamp: Date.now(),
  }),
  get: async () => null,
  save: async () => {},
});

const createMockActorPort = () => ({
  tick: async (actorId: string) => {
    // Mock tick implementation
  },
  create: async (config: ActorConfig) => `actor-${Date.now()}`,
  get: async () => null,
});

test('makeOrchestrator creates orchestrator with all methods', (t) => {
  const deps: OrchestratorDeps = {
    toolPort: createMockToolPort(),
    contextPort: createMockContextPort(),
    actorPort: createMockActorPort(),
  };

  const orchestrator = makeOrchestrator(deps);

  t.is(typeof orchestrator.processCommand, 'function');
  t.is(typeof orchestrator.compileContext, 'function');
  t.is(typeof orchestrator.tickActor, 'function');
  t.is(typeof orchestrator.createActor, 'function');
  t.is(typeof orchestrator.getActor, 'function');
});

test('orchestrator.processCommand delegates to toolPort', async (t) => {
  const mockToolPort = createMockToolPort();
  const deps: OrchestratorDeps = {
    toolPort: mockToolPort,
    contextPort: createMockContextPort(),
    actorPort: createMockActorPort(),
  };

  const orchestrator = makeOrchestrator(deps);
  const result = await orchestrator.processCommand('test-command', { param: 'value' });

  t.deepEqual(result, {
    command: 'test-command',
    args: { param: 'value' },
    executed: true,
  });
});

test('orchestrator.processCommand without args', async (t) => {
  const mockToolPort = createMockToolPort();
  const deps: OrchestratorDeps = {
    toolPort: mockToolPort,
    contextPort: createMockContextPort(),
    actorPort: createMockActorPort(),
  };

  const orchestrator = makeOrchestrator(deps);
  const result = await orchestrator.processCommand('simple-command');

  t.deepEqual(result, {
    command: 'simple-command',
    args: undefined,
    executed: true,
  });
});

test('orchestrator.compileContext delegates to contextPort', async (t) => {
  const mockContextPort = createMockContextPort();
  const deps: OrchestratorDeps = {
    toolPort: createMockToolPort(),
    contextPort: mockContextPort,
    actorPort: createMockActorPort(),
  };

  const orchestrator = makeOrchestrator(deps);
  const result = await orchestrator.compileContext(['source1'], 'test text');

  t.is(result.id, 'test-context');
  t.deepEqual(result.sources, ['source1']);
  t.is(result.text, 'test text');
  t.deepEqual(result.compiled, { processed: true });
  t.true(result.timestamp > 0);
});

test('orchestrator.tickActor delegates to actorPort', async (t) => {
  const mockActorPort = createMockActorPort();
  const deps: OrchestratorDeps = {
    toolPort: createMockToolPort(),
    contextPort: createMockContextPort(),
    actorPort: mockActorPort,
  };

  const orchestrator = makeOrchestrator(deps);

  await t.notThrowsAsync(() => orchestrator.tickActor('actor-123'));
});

test('orchestrator.createActor delegates to actorPort', async (t) => {
  const mockActorPort = createMockActorPort();
  const deps: OrchestratorDeps = {
    toolPort: createMockToolPort(),
    contextPort: createMockContextPort(),
    actorPort: mockActorPort,
  };

  const orchestrator = makeOrchestrator(deps);
  const config: ActorConfig = {
    name: 'test-actor',
    type: 'llm',
    parameters: { model: 'gpt-4' },
  };

  const actorId = await orchestrator.createActor(config);

  t.is(typeof actorId, 'string');
  t.true(actorId.startsWith('actor-'));
});

test('orchestrator.getActor delegates to actorPort', async (t) => {
  const mockActorPort = createMockActorPort();
  const deps: OrchestratorDeps = {
    toolPort: createMockToolPort(),
    contextPort: createMockContextPort(),
    actorPort: mockActorPort,
  };

  const orchestrator = makeOrchestrator(deps);
  const result = await orchestrator.getActor('non-existing');

  t.is(result, null);
});

test('orchestrator handles all actor types', async (t) => {
  const mockActorPort = createMockActorPort();
  const deps: OrchestratorDeps = {
    toolPort: createMockToolPort(),
    contextPort: createMockContextPort(),
    actorPort: mockActorPort,
  };

  const orchestrator = makeOrchestrator(deps);
  const actorTypes: ActorConfig['type'][] = ['llm', 'tool', 'composite'];

  for (const type of actorTypes) {
    const config: ActorConfig = {
      name: `test-${type}`,
      type,
      parameters: {},
    };

    const actorId = await orchestrator.createActor(config);
    t.is(typeof actorId, 'string');
  }
});
