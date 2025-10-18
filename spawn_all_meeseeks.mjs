#!/usr/bin/env node

import { spawnSession } from './packages/opencode-client/dist/index.js';
import { readFileSync } from 'fs';

const allTasks = readFileSync('/tmp/all_tasks.txt', 'utf8').trim().split('\n');

async function spawnAllSessions() {
  console.log(`Spawning meeseeks sessions for ${allTasks.length} tasks...`);

  for (let i = 0; i < allTasks.length; i++) {
    const taskId = allTasks[i];
    try {
      console.log(`Spawning session ${i + 1}/${allTasks.length}: ${taskId}`);

      await spawnSession({
        prompt: `Complete the task: ${taskId}. Read the task file and implement the solution with maximum determination and persistence.`,
        files: [`docs/agile/tasks/${taskId}.md`],
        delegates: ['meeseeks-problem-solver'],
      });

      // Small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to spawn session for ${taskId}:`, error.message);
    }
  }

  console.log('All meeseeks sessions spawned!');
}

spawnAllSessions().catch(console.error);
