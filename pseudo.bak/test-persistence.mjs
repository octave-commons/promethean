#!/usr/bin/env node

/**
 * Simple test for agent persistence functionality
 */

import { AgentTaskManager, DualStoreManager } from './dist/index.js';

async function testAgentPersistence() {
  console.log('🧪 Testing Agent Persistence Functionality');

  try {
    // Create stores
    const sessionStore = await DualStoreManager.create(
      'test_session_messages',
      'text',
      'timestamp',
    );
    const agentTaskStore = await DualStoreManager.create('test_agent_tasks', 'text', 'timestamp');

    // Initialize AgentTaskManager
    AgentTaskManager.initializeStores(sessionStore, agentTaskStore);

    // Test 1: Create a task
    console.log('\n📝 Test 1: Creating agent task...');
    const sessionId = 'test_session_' + Date.now();
    const task = 'Test task for persistence';

    const agentTask = await AgentTaskManager.createTask(sessionId, task);
    console.log('✅ Task created:', { sessionId, task, status: agentTask.status });

    // Test 2: Load persisted tasks
    console.log('\n🔄 Test 2: Loading persisted tasks...');
    await AgentTaskManager.loadPersistedTasks();
    console.log('✅ Tasks loaded successfully');

    // Test 3: Get all tasks
    console.log('\n📋 Test 3: Getting all tasks...');
    const allTasks = await AgentTaskManager.getAllTasks();
    console.log('✅ Total tasks:', allTasks.size);

    // Test 4: Update task status
    console.log('\n🔄 Test 4: Updating task status...');
    await AgentTaskManager.updateTaskStatus(sessionId, 'completed', 'Test completed successfully');
    console.log('✅ Task status updated');

    // Test 5: Verify persistence
    console.log('\n💾 Test 5: Verifying persistence...');
    const updatedTasks = await AgentTaskManager.getAllTasks();
    const updatedTask = updatedTasks.get(sessionId);
    if (updatedTask && updatedTask.status === 'completed') {
      console.log('✅ Persistence verified - task status persisted correctly');
    } else {
      console.log('❌ Persistence failed - task status not updated');
    }

    console.log('\n🎉 All tests passed! Agent persistence is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAgentPersistence();
