/**
 * Example usage of the Unified Agent Management API
 * Demonstrates common patterns for managing agent sessions
 */

import {
  createAgentSession,
  startAgentSession,
  stopAgentSession,
  sendMessageToAgent,
  closeAgentSession,
  unifiedAgentManager,
} from '../api/UnifiedAgentManager.js';

async function basicExample() {
  console.log('🚀 Basic Agent Management Example\n');

  try {
    // Create a new agent session with a task
    const session = await createAgentSession(
      'Analyze the performance of the current codebase and suggest optimizations',
      'Please focus on database queries and API endpoints',
      {
        title: 'Performance Analysis Task',
        files: ['src/api/', 'src/database/'],
        priority: 'high',
        taskType: 'analysis',
      },
      {
        autoStart: true,
        onStatusChange: (sessionId, oldStatus, newStatus) => {
          console.log(`📊 Status change for ${sessionId}: ${oldStatus} → ${newStatus}`);
        },
        onMessage: (sessionId, message) => {
          console.log(`💬 Message in ${sessionId}:`, message);
        },
      },
    );

    console.log(`✅ Created session: ${session.sessionId}`);
    console.log(`📝 Task: ${session.task.task}`);
    console.log(`🔄 Status: ${session.status}`);

    // Send additional messages
    await sendMessageToAgent(
      session.sessionId,
      'Also check for any memory leaks in the application',
    );

    // Wait a bit (in real usage, you'd wait for actual completion)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Stop the session with a completion message
    await stopAgentSession(session.sessionId, 'Performance analysis completed successfully');

    console.log(`🏁 Session stopped: ${session.sessionId}`);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

async function batchProcessingExample() {
  console.log('\n🔄 Batch Processing Example\n');

  const tasks = [
    'Review authentication code for security vulnerabilities',
    'Optimize database connection pooling',
    'Add unit tests for user management module',
    'Update API documentation',
  ];

  const sessions = [];

  try {
    // Create multiple sessions
    for (const task of tasks) {
      const session = await createAgentSession(
        task,
        undefined,
        {
          title: `Task: ${task.substring(0, 30)}...`,
          priority: 'medium',
        },
        { autoStart: false },
      );

      sessions.push(session);
      console.log(`📋 Created session: ${session.sessionId} for: ${task}`);
    }

    // Start all sessions
    console.log('\n🚀 Starting all sessions...');
    for (const session of sessions) {
      await startAgentSession(session.sessionId);
      console.log(`▶️  Started: ${session.sessionId}`);
    }

    // Monitor progress
    console.log('\n📊 Monitoring progress...');
    const stats = unifiedAgentManager.getSessionStats();
    console.log(`Total sessions: ${stats.total}`);
    console.log('By status:', stats.byStatus);

    // Cleanup completed sessions (in real usage, you'd check actual completion)
    console.log('\n🧹 Cleaning up sessions...');
    for (const session of sessions) {
      await closeAgentSession(session.sessionId);
      console.log(`🗑️  Closed: ${session.sessionId}`);
    }
  } catch (error) {
    console.error('❌ Batch processing error:', (error as Error).message);
  }
}

async function eventDrivenExample() {
  console.log('\n🎯 Event-Driven Example\n');

  try {
    const session = await createAgentSession(
      'Monitor application logs for errors and create alerts',
      'Focus on critical errors and performance issues',
      {
        title: 'Log Monitoring Task',
        priority: 'high',
      },
      {
        autoStart: true,
        onStatusChange: (sessionId, oldStatus, newStatus) => {
          console.log(`🔄 Event: ${sessionId} changed from ${oldStatus} to ${newStatus}`);

          // React to status changes
          if (newStatus === 'completed') {
            console.log(`🎉 Session ${sessionId} completed!`);
          } else if (newStatus === 'failed') {
            console.log(`⚠️  Session ${sessionId} failed!`);
          }
        },
        onMessage: (sessionId, message) => {
          console.log(`📨 New message in ${sessionId}:`, message);

          // React to messages
          if (message.type === 'error') {
            console.log(`🚨 Error detected in session ${sessionId}`);
          }
        },
      },
    );

    // Simulate sending different types of messages
    await sendMessageToAgent(session.sessionId, 'Start monitoring error logs', 'command');
    await sendMessageToAgent(session.sessionId, 'Found 5 critical errors', 'alert');
    await sendMessageToAgent(session.sessionId, 'Analysis complete', 'status');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    await closeAgentSession(session.sessionId);
  } catch (error) {
    console.error('❌ Event-driven error:', (error as Error).message);
  }
}

async function statisticsAndCleanupExample() {
  console.log('\n📈 Statistics and Cleanup Example\n');

  try {
    // Create some test sessions
    await createAgentSession('Test task 1', undefined, {}, { autoStart: true });
    await createAgentSession('Test task 2', undefined, {}, { autoStart: false });
    await createAgentSession('Test task 3', undefined, {}, { autoStart: true });

    console.log('📊 Current Statistics:');
    let stats = unifiedAgentManager.getSessionStats();
    console.log(`Total sessions: ${stats.total}`);
    console.log('By status:', stats.byStatus);
    console.log(`Average age: ${Math.round(stats.averageAge / 1000)}s`);

    // Get sessions by status
    const runningSessions = unifiedAgentManager.getSessionsByStatus('running');
    console.log(`\n🏃 Running sessions: ${runningSessions.length}`);

    const initializingSessions = unifiedAgentManager.getSessionsByStatus('initializing');
    console.log(`⏳ Initializing sessions: ${initializingSessions.length}`);

    // List all sessions with details
    console.log('\n📋 All Sessions:');
    const allSessions = unifiedAgentManager.listAgentSessions();
    allSessions.forEach((session) => {
      console.log(
        `  ${session.sessionId.substring(0, 8)} - ${session.status} - ${session.task.task.substring(0, 30)}...`,
      );
    });

    // Cleanup old sessions (using a very short age for demo)
    console.log('\n🧹 Cleaning up old sessions...');
    const cleaned = await unifiedAgentManager.cleanupOldSessions(0); // Clean all
    console.log(`Cleaned ${cleaned} sessions`);
  } catch (error) {
    console.error('❌ Statistics error:', (error as Error).message);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🎭 Unified Agent Management Examples\n');
  console.log('='.repeat(50));

  await basicExample();
  await batchProcessingExample();
  await eventDrivenExample();
  await statisticsAndCleanupExample();

  console.log('\n✅ All examples completed!');
}

// Export for individual testing
export {
  basicExample,
  batchProcessingExample,
  eventDrivenExample,
  statisticsAndCleanupExample,
  runAllExamples,
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
