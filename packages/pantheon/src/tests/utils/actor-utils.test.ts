import test from 'ava';
import type { ActorState } from '@promethean-os/pantheon-core';

import {
  createActorSummary,
  isActorActive,
  isActorCompleted,
  getActorAge,
  getActorIdleTime,
} from '../../utils/index.js';

// Mock actor for testing
const createMockActor = (overrides = {}) => ({
  id: 'actor-123',
  script: {
    name: 'test-actor',
    contextSources: [],
    talents: [
      {
        name: 'talent1',
        behaviors: [],
      },
      {
        name: 'talent2',
        behaviors: [],
      },
    ],
  },
  goals: ['goal1', 'goal2'],
  state: 'running' as ActorState,
  createdAt: new Date(Date.now() - 60000), // 1 minute ago
  updatedAt: new Date(Date.now() - 30000), // 30 seconds ago
  ...overrides,
});

test('createActorSummary generates correct summary', (t) => {
  const actor = createMockActor();
  const summary = createActorSummary(actor);

  t.true(summary.includes('test-actor'));
  t.true(summary.includes('actor-123'));
  t.true(summary.includes('running'));
  t.true(summary.includes('2 goals'));
  t.true(summary.includes('2 talents'));
});

test('createActorSummary with different states', (t) => {
  const states: ActorState[] = ['running', 'idle', 'completed', 'failed'];

  states.forEach((state) => {
    const actor = createMockActor({ state });
    const summary = createActorSummary(actor);

    t.true(summary.includes(state));
  });
});

test('isActorActive identifies active actors', (t) => {
  const runningActor = createMockActor({ state: 'running' });
  const idleActor = createMockActor({ state: 'idle' });
  const completedActor = createMockActor({ state: 'completed' });
  const failedActor = createMockActor({ state: 'failed' });

  t.true(isActorActive(runningActor));
  t.true(isActorActive(idleActor));
  t.false(isActorActive(completedActor));
  t.false(isActorActive(failedActor));
});

test('isActorCompleted identifies completed actors', (t) => {
  const runningActor = createMockActor({ state: 'running' });
  const idleActor = createMockActor({ state: 'idle' });
  const completedActor = createMockActor({ state: 'completed' });
  const failedActor = createMockActor({ state: 'failed' });

  t.false(isActorCompleted(runningActor));
  t.false(isActorCompleted(idleActor));
  t.true(isActorCompleted(completedActor));
  t.true(isActorCompleted(failedActor));
});

test('getActorAge calculates correct age', (t) => {
  const now = Date.now();
  const createdAt = new Date(now - 60000); // 1 minute ago
  const actor = createMockActor({ createdAt });

  const age = getActorAge(actor);

  t.true(age >= 59000); // Allow some variance
  t.true(age <= 61000);
});

test('getActorAge with recent actor', (t) => {
  const now = Date.now();
  const createdAt = new Date(now - 1000); // 1 second ago
  const actor = createMockActor({ createdAt });

  const age = getActorAge(actor);

  t.true(age >= 900);
  t.true(age <= 1100);
});

test('getActorIdleTime calculates correct idle time', (t) => {
  const now = Date.now();
  const updatedAt = new Date(now - 30000); // 30 seconds ago
  const actor = createMockActor({ updatedAt });

  const idleTime = getActorIdleTime(actor);

  t.true(idleTime >= 29000);
  t.true(idleTime <= 31000);
});

test('getActorIdleTime with recently updated actor', (t) => {
  const now = Date.now();
  const updatedAt = new Date(now - 500); // 0.5 seconds ago
  const actor = createMockActor({ updatedAt });

  const idleTime = getActorIdleTime(actor);

  t.true(idleTime >= 400);
  t.true(idleTime <= 600);
});

test('actor utilities handle edge cases', (t) => {
  const now = Date.now();
  const recentActor = createMockActor({
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });

  // Age and idle time should be very small for recent actors
  t.true(getActorAge(recentActor) < 100);
  t.true(getActorIdleTime(recentActor) < 100);
});
