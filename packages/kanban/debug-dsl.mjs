#!/usr/bin/env node

import { loadString } from 'nbb';
import { writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

console.log('Testing DSL loading...');

try {
  // Create a temporary DSL file
  const tmpDir = tmpdir();
  const dslPath = join(tmpDir, 'test-dsl.clj');
  
  const dslContent = `
(ns kanban-transitions
  (:require [clojure.spec.alpha :as s]))

(defn evaluate-transition [from to task board]
  (println "evaluate-transition called with:" from to task board)
  true)
`;
  
  await writeFile(dslPath, dslContent, 'utf8');
  console.log('DSL file written to:', dslPath);
  console.log('DSL content:');
  console.log(dslContent);
  
  // Try to load the DSL
  console.log('\nLoading DSL...');
  await loadString(dslContent, {
    context: 'cljs.user',
    print: console.log,
  });
  
  console.log('\nTrying to call evaluate-transition...');
  const result = await loadString('(kanban-transitions/evaluate-transition "Todo" "In Progress" {:title "test"} {:columns []})', {
    context: 'cljs.user',
    print: console.log,
  });
  
  console.log('Result:', result);
  
} catch (error) {
  console.error('Error:', error);
  console.error('Stack:', error.stack);
}