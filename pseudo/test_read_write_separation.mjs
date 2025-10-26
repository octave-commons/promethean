#!/usr/bin/env node

/**
 * Test script to verify read/write separation architecture
 */

import { DualStoreManager } from '@promethean/persistence';

async function testReadWriteSeparation() {
  console.log('🧪 Testing Read/Write Separation Architecture...\n');

  try {
    // Initialize stores
    console.log('📦 Initializing stores...');
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
    const agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');
    console.log('✅ Stores initialized successfully\n');

    // Test 1: Write a session with agent task properties
    console.log('📝 Test 1: Writing agent session...');
    const agentSession = {
      id: 'test_agent_session_123',
      title: 'Test Agent Session (@fullstack-developer subagent)',
      messageCount: 0,
      lastActivityTime: new Date().toISOString(),
      activityStatus: 'active',
      isAgentTask: true, // This should be detected by CLI
      agentTaskStatus: 'running',
      createdAt: new Date().toISOString(),
    };

    await sessionStore.insert({
      id: `session:${agentSession.id}`,
      text: JSON.stringify(agentSession),
      timestamp: Date.now(),
      metadata: {
        title: agentSession.title,
        isAgentTask: agentSession.isAgentTask,
        agentTaskStatus: agentSession.agentTaskStatus,
        createdAt: agentSession.createdAt,
        source: 'test_script',
      },
    });
    console.log('✅ Agent session written to store\n');

    // Test 2: Write a regular session
    console.log('📝 Test 2: Writing regular session...');
    const regularSession = {
      id: 'test_regular_session_456',
      title: 'Regular User Session',
      messageCount: 5,
      lastActivityTime: new Date().toISOString(),
      activityStatus: 'active',
      isAgentTask: false, // This should NOT be detected as agent task
      createdAt: new Date().toISOString(),
    };

    await sessionStore.insert({
      id: `session:${regularSession.id}`,
      text: JSON.stringify(regularSession),
      timestamp: Date.now(),
      metadata: {
        title: regularSession.title,
        isAgentTask: regularSession.isAgentTask,
        createdAt: regularSession.createdAt,
        source: 'test_script',
      },
    });
    console.log('✅ Regular session written to store\n');

    // Test 3: Read back and verify
    console.log('🔍 Test 3: Reading back sessions...');
    const recentSessions = await sessionStore.getMostRecent(10);
    console.log(`Found ${recentSessions.length} sessions in store`);

    for (const sessionEntry of recentSessions) {
      const sessionData = JSON.parse(sessionEntry.text);
      console.log(
        `- ${sessionData.id}: ${sessionData.title} (Agent Task: ${sessionData.isAgentTask})`,
      );
    }
    console.log('✅ Sessions read successfully\n');

    // Test 4: Simulate CLI list action logic
    console.log('🔍 Test 4: Simulating CLI list logic...');

    // Parse sessions like the CLI does
    const parsedSessions = recentSessions.map((session) => {
      const sessionData = JSON.parse(session.text);
      return {
        id: sessionData.id,
        title: sessionData.title,
        isAgentTask: sessionData.isAgentTask,
        agentTaskStatus: sessionData.agentTaskStatus,
        createdAt: sessionData.createdAt,
      };
    });

    // Filter for test sessions
    const testSessions = parsedSessions.filter(
      (s) => s.id.includes('test_agent_session_123') || s.id.includes('test_regular_session_456'),
    );

    console.log('Test sessions found:');
    testSessions.forEach((session) => {
      console.log(`- ${session.id}: ${session.title}`);
      console.log(`  isAgentTask: ${session.isAgentTask}`);
      console.log(`  Should show as Agent Task: ${session.isAgentTask ? 'YES' : 'NO'}`);
    });

    console.log('\n🎉 Read/Write Separation Test Complete!');
    console.log('📊 Summary:');
    console.log(`- Total sessions in store: ${recentSessions.length}`);
    console.log(`- Agent sessions: ${parsedSessions.filter((s) => s.isAgentTask).length}`);
    console.log(`- Regular sessions: ${parsedSessions.filter((s) => !s.isAgentTask).length}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testReadWriteSeparation();
