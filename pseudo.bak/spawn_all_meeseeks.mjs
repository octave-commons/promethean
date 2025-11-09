#!/usr/bin/env node

import { createAgentSession, initializeStores } from './packages/opencode-client/dist/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize stores first
try {
  // This would need proper store initialization - for now let's try without it
  console.log('Starting Meeseeks spawning process...');
} catch (error) {
  console.log('Store initialization failed, continuing anyway...');
}

const allTasks = readFileSync('/tmp/all_tasks.txt', 'utf8').trim().split('\n');

async function spawnAllSessions() {
  console.log(`Spawning meeseeks sessions for ${allTasks.length} tasks...`);

  for (let i = 0; i < allTasks.length; i++) {
    const taskId = allTasks[i];
    try {
      console.log(`Spawning session ${i + 1}/${allTasks.length}: ${taskId}`);

      await createAgentSession(
        `Complete the task: ${taskId}. Read the task file and implement the solution with maximum determination and persistence.`,
        `Task UUID: ${taskId}
        
Please analyze this task thoroughly and implement the solution. Follow all project conventions and best practices. Use the kanban system to track your progress and update the task status as you work.

Key requirements:
1. Read the task file to understand full context
2. Follow the coding standards outlined in AGENTS.md
3. Update task status through the kanban CLI as you progress
4. Test your implementation if applicable
5. Document any important decisions or changes`,
        {
          title: `Task: ${taskId}`,
          files: [`docs/agile/tasks/${taskId}.md`],
          delegates: ['meeseeks-problem-solver'],
          priority: 'medium',
          taskType: 'kanban-task',
        },
        {
          autoStart: true,
        },
      );

      console.log(`✅ Successfully spawned Meeseeks for task: ${taskId}`);

      // Small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to spawn session for ${taskId}:`, error.message);
      // Continue with next task even if one fails
    }
  }

  console.log('🎉 All meeseeks spawning completed!');
}

spawnAllSessions().catch(console.error);
