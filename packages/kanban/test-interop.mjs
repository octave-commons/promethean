#!/usr/bin/env node

// Simple test to verify ClojureScript interop is working
import { loadFile } from 'nbb';

async function testClojureInterop() {
  try {
    console.log('Testing ClojureScript interop...');

    // Load the test DSL file
    const dslFunctions = await loadFile('./test-rules.clj');

    if (!dslFunctions['test-eval']) {
      throw new Error('test-eval function not found');
    }

    // Test with JavaScript objects
    const testTask = {
      uuid: 'test-123',
      title: 'Test Task',
      priority: 'P1',
      status: 'todo',
    };

    const testBoard = {
      columns: [{ name: 'todo', tasks: [], limit: 10 }],
    };

    // Call the ClojureScript function with JavaScript objects
    const result = dslFunctions['test-eval']('todo', 'in-progress', testTask, testBoard);

    console.log('✅ ClojureScript interop working!');
    console.log('Result:', result);
    console.log('Task object passed successfully:', testTask.title);
    console.log('Board object passed successfully:', testBoard.columns.length, 'columns');
  } catch (error) {
    console.error('❌ ClojureScript interop failed:', error.message);
    process.exit(1);
  }
}

testClojureInterop();
