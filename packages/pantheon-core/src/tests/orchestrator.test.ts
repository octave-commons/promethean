import test from 'ava';
import { makeOrchestrator } from '../core/orchestrator.js';
import type { Actor } from '../core/types.js';

const makeDeps = () => {
  const logs: unknown[] = [];
  return {
    now: () => 123,
    log: (m: string, meta?: unknown) => logs.push({ m, meta }),
    context: { compile: async () => [] },
    tools: { invoke: async () => ({ ok: true }) },
    llm: { complete: async () => ({ role: 'assistant' as const, content: 'ok' }) },
    bus: { send: async () => undefined, subscribe: () => () => {} },
    schedule: { every: () => () => {}, once: () => {} },
    state: {
      spawn: async () => {
        throw new Error('not used here');
      },
      get: async () => null,
      update: async () => undefined,
      list: async () => [],
    },
  };
};

const makeActor = (): Actor => ({
  id: 'a1',
  state: 'idle',
  script: {
    name: 'demo',
    contextSources: [],
    talents: [
      {
        name: 't',
        behaviors: [
          {
            name: 'b',
            mode: 'active',
            plan: async () => ({
              actions: [
                { type: 'message', content: 'hey', target: 'user' },
                { type: 'tool', name: 't1', args: { x: 1 } },
              ],
            }),
          },
        ],
      },
    ],
  },
  goals: ['g'],
  createdAt: new Date(0),
  updatedAt: new Date(0),
  metadata: {},
});

test('orchestrator executes behavior actions', async (t) => {
  const deps = makeDeps();
  const updates: any[] = [];
  deps.state.update = async (_id: string, patch: Partial<Actor>) => {
    updates.push(patch);
    return {} as Actor;
  };
  const orch = makeOrchestrator(deps as any);

  await t.notThrowsAsync(() => orch.tickActor(makeActor(), { userMessage: 'hi' }));
  t.true(updates.some((u) => u.state === 'completed'));
});
