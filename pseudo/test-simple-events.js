#!/usr/bin/env node

import { sessionStore } from './packages/opencode-client/dist/index.js';

async function testEventStorage() {
  console.log('🧪 Testing Event Storage in Dual Store...\n');

  try {
    // 1. Create some test events
    const testEvents = [
      {
        id: 'event:test-1',
        type: 'session.created',
        sessionId: 'test-session-1',
        timestamp: new Date().toISOString(),
        data: { title: 'Test Session 1' },
      },
      {
        id: 'event:test-2',
        type: 'session.updated',
        sessionId: 'test-session-1',
        timestamp: new Date().toISOString(),
        data: { changes: ['title updated'] },
      },
      {
        id: 'event:test-3',
        type: 'agent.task.started',
        sessionId: 'test-session-2',
        timestamp: new Date().toISOString(),
        data: { agentId: 'test-agent', taskId: 'test-task' },
      },
    ];

    console.log('📝 Storing test events...');
    for (const event of testEvents) {
      try {
        await sessionStore.addEntry({
          id: event.id,
          text: JSON.stringify(event),
          timestamp: Date.now(),
        });
        console.log(`✅ Stored ${event.id}`);
      } catch (error) {
        console.error(`❌ Failed to store ${event.id}:`, error.message);
      }
    }

    // 2. Test retrieving events
    console.log('\n📋 Retrieving events from dual store...');
    const entries = await sessionStore.getMostRecent(10);
    const eventEntries = entries.filter((entry) => entry.id && entry.id.startsWith('event:'));

    console.log(`Found ${eventEntries.length} events:`);
    for (const entry of eventEntries) {
      const event = JSON.parse(entry.text);
      console.log(`  - ${entry.id}: ${event.type} at ${event.timestamp}`);
    }

    // 3. Test CLI events list
    console.log('\n🔧 Testing CLI events list functionality...');
    try {
      const { list } = await import('./packages/opencode-client/dist/actions/events/list.js');

      const result = await list({
        client: null, // Mock client to force dual store usage
      });

      console.log('CLI Events List Result:');
      console.log(result);
    } catch (error) {
      console.error('❌ CLI events list failed:', error.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testEventStorage();
