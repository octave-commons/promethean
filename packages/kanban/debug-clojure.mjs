#!/usr/bin/env node

// Debug the JSON structure being passed to Clojure
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

const board = {
  columns: [
    {
      name: 'Todo',
      limit: 2,
      tasks: [sampleTask.uuid],
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
      limit: 0,
      tasks: [],
      count: 0,
    },
  ],
};

console.log('Board JSON:', JSON.stringify(board, null, 2));

// Test the Clojure conversion manually
const clojureCode = `
(require '[clojure.spec.alpha :as s])

(s/def :column/name string?)
(s/def :column/limit number?)
(s/def :column/count number?)
(s/def :column/tasks (s/coll-of any? :kind vector?))
(s/def :column/map (s/keys :req-un [:column/name :column/limit :column/count :column/tasks]))
(s/def :board/columns (s/coll-of :column/map :kind vector?))
(s/def :board/map (s/keys :req-un [:board/columns]))

(let [board-js ${JSON.stringify(board)}
      board (js->clj board-js :keywordize-keys true)
      valid? (s/valid? :board/map board)
      problems (when-not valid? (s/explain-data :board/map board))
      errors (when problems (map str (:clojure.spec.alpha/problems problems)))]
  {:isValid (boolean valid?) :errors (or errors [])})
`;

try {
  const { loadString } = await import('nbb');
  const result = await loadString(clojureCode, {
    context: 'cljs.user',
    print: () => {},
  });
  console.log('Clojure validation result:', result);
} catch (error) {
  console.error('Clojure validation error:', error);
}
