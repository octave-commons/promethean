import test from 'ava';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  initializeTransitionRulesEngine,
  validateTransition,
  type TransitionRulesConfig,
} from '../lib/transition-rules-functional.js';
import type { Board, Task } from '../lib/types.js';
import { withTempDir } from '../test-utils/helpers.js';

// Helper to create a minimal board
const makeBoard = (taskCount: number): Board => ({
  columns: [
    {
      name: 'todo',
      limit: 10,
      count: taskCount,
      tasks: Array.from({ length: taskCount }, (_, i) => ({
        uuid: `task-${i}`,
        title: `Task ${i}`,
        content: '',
        status: 'todo',
      })),
    },
    {
      name: 'in-progress',
      limit: 3,
      count: 0,
      tasks: [],
    },
    {
      name: 'done',
      limit: 10,
      count: 0,
      tasks: [],
    },
  ],
});

// Helper to create a minimal task
const makeTask = (overrides: Partial<Task> = {}): Task => ({
  uuid: 'test-uuid',
  title: 'Test Task',
  content: 'Test content',
  status: 'todo',
  priority: 'P1',
  ...overrides,
});

// Helper function to create testing config
const createTestingConfig = () => ({
  enabled: false,
  scoring: {
    enabled: false,
    weights: {
      coverage: 0,
      quality: 0,
      requirementMapping: 0,
      aiAnalysis: 0,
      performance: 0,
    },
    priorityThresholds: {
      P0: { coverage: 95, quality: 90, overall: 92 } as const,
      P1: { coverage: 90, quality: 85, overall: 87 } as const,
      P2: { coverage: 85, quality: 80, overall: 82 } as const,
      P3: { coverage: 80, quality: 75, overall: 77 } as const,
    },
    adaptiveThresholds: false,
    historicalTrending: false,
  },
  thresholds: { coverage: 0, quality: 0, softBlock: 0, hardBlock: 0 },
  hardBlockCoverageThreshold: 0,
  softBlockQualityScoreThreshold: 0,
  weights: { coverage: 0, quality: 0, requirementMapping: 0, contextualAnalysis: 0 },
  timeouts: {
    coverageAnalysis: 0,
    qualityAssessment: 0,
    requirementMapping: 0,
    totalAnalysis: 0,
  },
  reporting: {
    includeDetailedRationale: false,
    generateActionItems: false,
    appendToTask: false,
  },
});

test('Clojure DSL validation works with functional API', async (t) => {
  const tmpDir = await withTempDir(t);

  // Create a simple Clojure DSL file that blocks all transitions
  const dslPath = path.join(tmpDir, 'rules.clj');
  const dslContent = `
(ns kanban-transitions
  (:require [clojure.spec.alpha :as s]))

(defn evaluate-transition [from to task board]
  ;; Always block transitions for testing
  false)
`;
  await writeFile(dslPath, dslContent, 'utf-8');

  const config: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath,
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const engineResult = await initializeTransitionRulesEngine({
    config,
    dslAvailable: true,
    testingConfig: createTestingConfig(),
  });
  const engineState = engineResult.newState;

  const sampleTask = makeTask();
  const board = makeBoard(0);

  const transitionResult = await validateTransition(
    engineState,
    'todo',
    'inprogress',
    sampleTask,
    board,
  );

  t.false(transitionResult.result.allowed, 'Transition should be blocked by Clojure DSL');
});

test('Functional API fails fast without Clojure DSL', async (t) => {
  const configWithoutDSL: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath: '',
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  await t.throwsAsync(
    async () =>
      initializeTransitionRulesEngine({
        config: configWithoutDSL,
        dslAvailable: false,
        testingConfig: createTestingConfig(),
      }),
    {
      message: /Clojure DSL is required/,
    },
  );
});

test('Functional API requires Clojure DSL - throws error when DSL file not found', async (t) => {
  const configWithMissingDSL: TransitionRulesConfig = {
    enabled: true,
    enforcement: 'strict',
    dslPath: '/nonexistent/path/rules.clj',
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  await t.throwsAsync(
    async () =>
      initializeTransitionRulesEngine({
        config: configWithMissingDSL,
        dslAvailable: true,
        testingConfig: createTestingConfig(),
      }),
    {
      message: /Failed to load Clojure DSL/,
    },
  );
});
