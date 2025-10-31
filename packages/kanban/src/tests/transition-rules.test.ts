import test from 'ava';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  TransitionRulesEngine,
  createTransitionRulesEngine,
  type TransitionRulesConfig,
} from '../lib/transition-rules.js';
import type { Board, Task } from '../lib/types.js';
import { withTempDir } from '../test-utils/helpers.js';

const sampleTask: Task = {
  uuid: 'task-1',
  title: 'Implement feature',
  status: 'todo',
  priority: 'P1',
  labels: ['dev'],
  created_at: '2024-01-01T00:00:00.000Z',
  estimates: { complexity: 3 },
  content: 'Details',
};

const makeBoard = (inProgressCount: number): Board => ({
  columns: [
    {
      name: 'Todo',
      limit: 2,
      tasks: [sampleTask],
      count: 1,
    },
    {
      name: 'In Progress',
      limit: 1,
      tasks: new Array(inProgressCount).fill(null).map((_, index) => ({
        ...sampleTask,
        uuid: `ip-${index}`,
      })),
      count: inProgressCount,
    },
    {
      name: 'Review',
      limit: null,
      tasks: [],
      count: 0,
    },
  ],
});

const createConfig = (dslPath: string): TransitionRulesConfig => ({
  enabled: true,
  enforcement: 'strict',
  dslPath,
  rules: [
    {
      from: ['todo'],
      to: ['inprogress'],
      description: 'Start work',
      check: 'basic-check',
    },
    {
      from: ['inprogress'],
      to: ['review'],
      description: 'Send to review',
      check: 'basic-check',
    },
  ],
  customChecks: {
    'basic-check': {
      description: 'Task must have title and priority',
      impl: '(fn [task board] (and (:title task) (:priority task)))',
    },
  },
  globalRules: [
    {
      name: 'wip-limits',
      description: 'Respect WIP limits',
      enabled: true,
      impl: '(fn [from to task board] true)',
    },
    {
      name: 'task-existence',
      description: 'Task must exist in source column',
      enabled: true,
      impl: '(fn [from to task board] true)',
    },
  ],
});

test('TransitionRulesEngine validates transitions and applies rules', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'rules.cljs');
  const dslContent = `
(ns kanban-transitions)

(defn evaluate-transition [from to task board]
  ;; Allow valid transitions, block invalid ones
  (or (and (= from "Todo") (= to "In Progress"))
      (and (= from "In Progress") (= to "Review"))
      (and (= from "Review") (= to "Done"))))
`;
  await writeFile(dslPath, dslContent, 'utf8');

  const engine = new TransitionRulesEngine(createConfig(dslPath));
  await engine.initialize();

  const board = makeBoard(0);
  const allowed = await engine.validateTransition('Todo', 'In Progress', sampleTask, board);
  t.true(allowed.allowed);

  const blocked = await engine.validateTransition('Todo', 'Review', sampleTask, board);
  t.false(blocked.allowed);
  t.true(
    blocked.ruleViolations.some((violation: string) => violation.includes('Invalid transition')),
  );
  t.true(
    blocked.suggestions.some((suggestion: string) => suggestion.includes('Valid transitions')),
  );
});

test('TransitionRulesEngine enforces WIP limits and custom checks', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'dsl.cljs');
  const dslContent = `
(ns kanban-transitions
  (:require [clojure.spec.alpha :as s]))

(defn evaluate-transition [from to task board]
  ;; Allow all transitions for WIP testing
  true)
`;
  await writeFile(dslPath, dslContent, 'utf8');

  const engine = new TransitionRulesEngine(createConfig(dslPath));
  await engine.initialize();

  const overCapacityBoard = makeBoard(1);
  const result = await engine.validateTransition(
    'Todo',
    'In Progress',
    sampleTask,
    overCapacityBoard,
  );
  t.false(result.allowed);
  t.true(result.ruleViolations.some((violation: string) => violation.includes('WIP')));

  const withoutPriority = { ...sampleTask, priority: undefined };
  const priorityCheck = await engine.validateTransition(
    'Todo',
    'In Progress',
    withoutPriority,
    makeBoard(0),
  );
  t.false(priorityCheck.allowed);
});

test('TransitionRulesEngine debugging and overview helpers', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'debug-rules.cljs');
  const dslContent = `
(ns kanban-transitions)

(defn evaluate-transition [from to task board]
  true) ; Allow all transitions for debugging
`;
  await writeFile(dslPath, dslContent, 'utf8');

  const engine = new TransitionRulesEngine(createConfig(dslPath));
  await engine.initialize();

  const debug = await engine.debugTransition('Todo', 'Review', sampleTask, makeBoard(0));
  t.is(debug.from, 'todo');
  t.true(debug.validTransitions.includes('inprogress'));

  const flow = engine.showProcessFlow();
  t.true(flow.includes('todo → inprogress'));

  const overview = engine.getTransitionsOverview();
  t.true(overview.globalRules.some((rule: string) => rule.includes('WIP')));
});

test('createTransitionRulesEngine loads configuration from paths', async (t) => {
  const tmp = await withTempDir(t);
  const configPath = path.join(tmp, 'config.json');
  const config = {
    transitionRules: createConfig(path.join(tmp, 'dsl.cljs')),
  };
  await writeFile(
    path.join(tmp, 'dsl.cljs'),
    `
(ns kanban-transitions
  (:require [clojure.spec.alpha :as s]))

(defn evaluate-transition [from to task board]
  ;; Allow all transitions for this test
  true)
`,
    'utf8',
  );
  await writeFile(configPath, JSON.stringify(config), 'utf8');

  const engine = await createTransitionRulesEngine([configPath, 'missing.json']);
  const summary = engine.getTransitionsOverview();
  t.true(summary.enabled);
});

// ===== CLOJURE-ONLY TRANSITION RULES TESTS =====

test('TransitionRulesEngine requires Clojure DSL - throws error when DSL path missing', async (t) => {
  const configWithoutDSL: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(configWithoutDSL);
  await t.throwsAsync(async () => engine.initialize(), {
    message: 'Clojure DSL path is required. TypeScript transition rules are no longer supported.',
  });
});

test('TransitionRulesEngine requires Clojure DSL - throws error when DSL file not found', async (t) => {
  const configWithMissingDSL: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath: '/nonexistent/path/rules.clj',
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(configWithMissingDSL);
  await t.throwsAsync(async () => engine.initialize(), {
    message: /Clojure DSL not found at: \/nonexistent\/path\/rules\.clj/,
  });
});

test('TransitionRulesEngine has no TypeScript fallback - createTransitionRulesEngine throws when no config found', async (t) => {
  await t.throwsAsync(
    async () =>
      createTransitionRulesEngine(['/nonexistent/config1.json', '/nonexistent/config2.json']),
    { message: /Failed to load transition rules configuration from any of the provided paths/ },
  );
});
