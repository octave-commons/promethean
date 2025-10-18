#!/usr/bin/env node

/**
 * Quick test to verify agent tasks are loaded and accessible
 */

import { DualStoreManager } from '@promethean/persistence';
import { initializeStores } from './dist/index.js';
import { AgentTaskManager } from './dist/api/AgentTaskManager.js';

async function testAgentTasks() {
  console.log('🧪 Testing agent tasks loading...\n');

  try {
    // Initialize stores
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
    const agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');
    initializeStores(sessionStore, agentTaskStore);

    // Load persisted tasks
    console.log('Loading persisted tasks...');
    const result = await AgentTaskManager.loadPersistedTasks();
    console.log(`✅ Loaded ${result.loadedCount} tasks\n`);

    // Get all tasks
    console.log('Getting all tasks...');
    const allTasks = await AgentTaskManager.getAllTasks();
    console.log(`✅ Found ${allTasks.size} tasks in memory\n`);

    // Display first few tasks
    let count = 0;
    for (const [sessionId, task] of allTasks.entries()) {
      if (count >= 3) break;
      console.log(`Task ${count + 1}:`);
      console.log(`  Session ID: ${sessionId}`);
      console.log(`  Task: ${task.task}`);
      console.log(`  Status: ${task.status}`);
      console.log(`  Start Time: ${new Date(task.startTime).toISOString()}`);
      console.log('');
      count++;
    }

    if (allTasks.size === 0) {
      console.log('⚠️ No tasks found. Agent tasks store is empty.');
    } else {
      console.log(`✅ Agent tasks are loaded and accessible! Total: ${allTasks.size}`);
    }
  } catch (error) {
    console.error('❌ Error testing agent tasks:', error);
    process.exit(1);
  }
}

testAgentTasks()
  .then(() => {
    console.log('\n🎉 Agent tasks test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
