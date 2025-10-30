#!/usr/bin/env node

// Simple test to verify transition rules work
import { TransitionRulesEngine } from './dist/lib/transition-rules.js';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

const sampleTask = {
  uuid: 'task-1',
  title: 'Implement feature',
  status: 'todo',
  priority: 'P1',
  labels: ['dev'],
  created_at: '2024-01-01T00:00:00.000Z',
  estimates: { complexity: 3 },
  content: 'Details',
};

const makeBoard = (inProgressCount) => ({
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

async function test() {
  try {
    const tmp = path.join(tmpdir(), 'test-dsl.clj');
    const validDSL = `
(ns kanban-transitions
  "Kanban transition rules DSL using Clojure + Babashka NBB"
  (:require [clojure.string :as str]))

(defn column-key [col-name]
  (-> col-name (str/lower-case) (str/replace #"\s+" "")))

(defn evaluate-transition [from to task board]
  true) ; Allow all transitions for test
    `;

    await writeFile(tmp, validDSL, 'utf8');

    const config = {
      enabled: true,
      enforcement: 'strict',
      dslPath: tmp,
      rules: [],
      customChecks: {},
      globalRules: [],
    };

    const engine = new TransitionRulesEngine(config);
    await engine.initialize();

    const board = makeBoard(0);
    const result = await engine.validateTransition('todo', 'inprogress', sampleTask, board);

    console.log('Result:', result);
    console.log('Test passed:', result.allowed);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
