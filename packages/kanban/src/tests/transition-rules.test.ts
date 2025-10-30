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
      check: '',
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
      impl: '',
    },
    {
      name: 'task-existence',
      description: 'Task must exist in source column',
      enabled: true,
      impl: '',
    },
  ],
});

test('TransitionRulesEngine validates transitions and applies rules', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'rules.cljs');
  await writeFile(dslPath, ';; mock', 'utf8');

  const engine = new TransitionRulesEngine(createConfig(dslPath));
  await engine.initialize();

  const board = makeBoard(0);
  const allowed = await engine.validateTransition('Todo', 'In Progress', sampleTask, board);
  t.true(allowed.allowed);

  const blocked = await engine.validateTransition('Todo', 'Review', sampleTask, board);
  t.false(blocked.allowed);
  t.true(blocked.ruleViolations.some((violation) => violation.includes('Invalid transition')));
  t.true(blocked.suggestions.some((suggestion) => suggestion.includes('Valid transitions')));
});

test('TransitionRulesEngine enforces WIP limits and custom checks', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'dsl.cljs');
  await writeFile(dslPath, ';; mock', 'utf8');

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
  t.true(result.ruleViolations.some((violation) => violation.includes('WIP')));

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
  const engine = new TransitionRulesEngine(createConfig(''));
  await engine.initialize();

  const debug = await engine.debugTransition('Todo', 'Review', sampleTask, makeBoard(0));
  t.is(debug.from, 'todo');
  t.true(debug.validTransitions.includes('inprogress'));

  const flow = engine.showProcessFlow();
  t.true(flow.includes('todo → inprogress'));

  const overview = engine.getTransitionsOverview();
  t.true(overview.globalRules.some((rule) => rule.includes('WIP')));
});

test('createTransitionRulesEngine loads configuration from paths', async (t) => {
  const tmp = await withTempDir(t);
  const configPath = path.join(tmp, 'config.json');
  const config = {
    transitionRules: createConfig(path.join(tmp, 'dsl.cljs')),
  };
  await writeFile(path.join(tmp, 'dsl.cljs'), ';; mock', 'utf8');
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

test('TransitionRulesEngine validates actual Clojure DSL content', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'kanban-transitions.clj');

  // Create a minimal valid Clojure DSL
  const validDSL = `
(ns kanban-transitions
  "Kanban transition rules DSL using Clojure + Babashka NBB"
  (:require [clojure.string :as str]))

(defn column-key [col-name]
  (-> col-name (str/lower-case) (str/replace #"\s+" "")))

(defn evaluate-transition [from to task board]
  true) ; Allow all transitions for test
  `;

  await writeFile(dslPath, validDSL, 'utf8');

  const config: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath,
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(config);
  await t.notThrowsAsync(async () => engine.initialize());

  // Test that we can actually evaluate Clojure code
  const board = makeBoard(0);
  const result = await engine.validateTransition('todo', 'inprogress', sampleTask, board);
  t.true(result.allowed);
});

test('TransitionRulesEngine rejects invalid Clojure DSL syntax', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'invalid-rules.clj');

  // Create invalid Clojure syntax
  const invalidDSL = `
(ns kanban-transitions
  (:require [clojure.string :as str])

(defn column-key [col-name]
  (-> col-name (str/lower-case) (str/replace #"\s+" ""))

;; Missing closing parenthesis - syntax error
(defn evaluate-transition [from to task board]
  true
  `;

  await writeFile(dslPath, invalidDSL, 'utf8');

  const config: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath,
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(config);
  await t.throwsAsync(async () => engine.initialize(), { message: /Clojure evaluation failed/ });
});

test('TransitionRulesEngine only uses Clojure for rule evaluation - no hardcoded TypeScript logic', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'test-rules.clj');

  // Create DSL that explicitly rejects all transitions
  const rejectingDSL = `
(ns kanban-transitions
  "Test DSL that rejects everything"
  (:require [clojure.string :as str]))

(defn column-key [col-name]
  (-> col-name (str/lower-case) (str/replace #"\s+" "")))

(defn evaluate-transition [from to task board]
  false) ; Reject all transitions
  `;

  await writeFile(dslPath, rejectingDSL, 'utf8');

  const config: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath,
    rules: [
      {
        from: ['todo'],
        to: ['inprogress'],
        description: 'Should be blocked by Clojure DSL',
        check: '',
      },
    ],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(config);
  await engine.initialize();

  // Even though TypeScript config allows the transition, Clojure DSL should block it
  const board = makeBoard(0);
  const result = await engine.validateTransition('todo', 'inprogress', sampleTask, board);
  t.false(
    result.allowed,
    'Transition should be blocked by Clojure DSL, not allowed by TypeScript config',
  );
  t.true(result.reason.includes('Clojure evaluation failed') || result.reason.includes('false'));
});

test('createTransitionRulesEngine fails fast without Clojure DSL - no fallback to TypeScript', async (t) => {
  // Test that the system doesn't create a disabled fallback engine
  await t.throwsAsync(async () => createTransitionRulesEngine(['/nonexistent/config.json']), {
    message: /Clojure DSL is required/,
  });
});

test('TransitionRulesEngine object conversion works correctly', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'conversion-test.clj');

  // DSL that checks for specific task properties
  const conversionTestDSL = `
(ns kanban-transitions
  "Test object conversion"
  (:require [clojure.string :as str]))

(defn column-key [col-name]
  (-> col-name (str/lower-case) (str/replace #"\s+" "")))

(defn evaluate-transition [from to task board]
  ;; Verify that JavaScript objects were converted to Clojure maps correctly
  (and (= (:uuid task) "test-uuid")
       (= (:title task) "Test Task")
       (= (:priority task) "P1")
       (= (:content task) "Test content")))
  `;

  await writeFile(dslPath, conversionTestDSL, 'utf8');

  const config: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath,
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(config);
  await engine.initialize();

  const testTask: Task = {
    uuid: 'test-uuid',
    title: 'Test Task',
    status: 'todo',
    priority: 'P1',
    labels: ['test'],
    created_at: '2024-01-01T00:00:00.000Z',
    content: 'Test content',
  };

  const board = makeBoard(0);
  const result = await engine.validateTransition('todo', 'inprogress', testTask, board);
  t.true(result.allowed, 'Object conversion should work correctly');
});
