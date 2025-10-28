import test from 'ava';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  TransitionRulesEngine,
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
  ],
});

test('TransitionRulesEngine requires Clojure DSL - throws error when DSL path missing', async (t) => {
  const configWithoutDSL: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engine = new TransitionRulesEngine(configWithoutDSL);
  await t.throwsAsync(
    async () => engine.initialize(),
    { message: 'Clojure DSL path is required. TypeScript transition rules are no longer supported.' }
  );
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
  await t.throwsAsync(
    async () => engine.initialize(),
    { message: /Clojure DSL not found at: \/nonexistent\/path\/rules\.clj/ }
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
  (-> col-name (str/lower-case) (str/replace #"\\s+" "")))

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

test('TransitionRulesEngine only uses Clojure for rule evaluation - no hardcoded TypeScript logic', async (t) => {
  const tmp = await withTempDir(t);
  const dslPath = path.join(tmp, 'test-rules.clj');
  
  // Create DSL that explicitly rejects all transitions
  const rejectingDSL = `
(ns kanban-transitions
  "Test DSL that rejects everything"
  (:require [clojure.string :as str]))

(defn column-key [col-name]
  (-> col-name (str/lower-case) (str/replace #"\\s+" "")))

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
  t.false(result.allowed, 'Transition should be blocked by Clojure DSL, not allowed by TypeScript config');
});

test('createTransitionRulesEngine fails fast without Clojure DSL - no fallback to TypeScript', async (t) => {
  await t.throwsAsync(
    async () => {
      // @ts-ignore - Import the function directly for testing
      const { createTransitionRulesEngine } = await import('../lib/transition-rules.js');
      await createTransitionRulesEngine(['/nonexistent/config.json']);
    },
    { message: /Clojure DSL is required/ }
  );
});