import { safeEvaluateTransition } from './dist/lib/safe-rule-evaluation.js';
import { writeFile } from 'node:fs/promises';
import { withTempDir } from 'tmp-promise';
import path from 'node:path';

async function testTransition() {
  const tmp = await withTempDir();
  const dslPath = path.join(tmp.path, 'rules.cljs');
  const dslContent = `
(ns kanban-transitions
  (:require [clojure.spec.alpha :as s]))

(defn evaluate-transition [from to task board]
  ;; Allow valid transitions, block invalid ones
  (or (and (= from "Todo") (= to "In Progress"))
      (and (= from "In Progress") (= to "Review"))
      (and (= from "Review") (= to "Done"))))
  `;
  await writeFile(dslPath, dslContent, 'utf8');

  const taskFM = {
    id: 'task-1',
    title: 'Implement feature',
    priority: 'high',
    owner: 'unassigned',
    labels: ['dev'],
    created: '2024-01-01T00:00:00.000Z',
    uuid: 'task-1',
    status: 'todo',
    estimates: { complexity: 3 },
  };

  const board = {
    columns: [
      {
        name: 'Todo',
        limit: 2,
        tasks: [
          {
            uuid: 'task-1',
            title: 'Implement feature',
            status: 'todo',
            priority: 'P1',
            labels: ['dev'],
            created_at: '2024-01-01T00:00:00.000Z',
            estimates: { complexity: 3 },
            content: 'Details',
          },
        ],
        count: 1,
      },
      {
        name: 'In Progress',
        limit: 1,
        tasks: [],
        count: 0,
      },
      {
        name: 'Review',
        limit: null,
        tasks: [],
        count: 0,
      },
    ],
  };

  try {
    console.log('Testing transition Todo -> In Progress...');
    const result = await safeEvaluateTransition(
      taskFM,
      board,
      '(evaluate-transition "Todo" "In Progress" task board)',
      dslPath,
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testTransition().catch(console.error);
