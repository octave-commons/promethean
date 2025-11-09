#!/usr/bin/env node

import { InMemoryEventBus } from '@promethean/event';
import { sessionStore } from './packages/opencode-client/dist/index.js';

async function testEvents() {
  console.log('🧪 Testing Event System Integration...\n');

  try {
    // 1. Create an in-memory event bus
    const eventBus = new InMemoryEventBus();
    console.log('✅ Created InMemoryEventBus');

    // 2. Publish some test events
    const event1 = await eventBus.publish('session.created', {
      sessionId: 'test-session-1',
      title: 'Test Session 1',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Published event 1:', event1.id);

    const event2 = await eventBus.publish('session.updated', {
      sessionId: 'test-session-1',
      changes: ['title updated'],
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Published event 2:', event2.id);

    const event3 = await eventBus.publish('agent.task.started', {
      agentId: 'test-agent',
      taskId: 'test-task',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Published event 3:', event3.id);

    // 3. Try to store events in dual store
    console.log('\n📦 Testing dual store event storage...');

    // Store events as session entries with event: prefix
    for (const event of [event1, event2, event3]) {
      try {
        await sessionStore.addEntry({
          id: `event:${event.id}`,
          text: JSON.stringify(event),
          timestamp: event.ts,
        });
        console.log(`✅ Stored event ${event.id} in dual store`);
      } catch (error) {
        console.error(`❌ Failed to store event ${event.id}:`, error.message);
      }
    }

    // 4. Test retrieving events from dual store
    console.log('\n📋 Testing dual store event retrieval...');
    const entries = await sessionStore.getMostRecent(10);
    const eventEntries = entries.filter((entry) => entry.id && entry.id.startsWith('event:'));

    console.log(`Found ${eventEntries.length} events in dual store:`);
    for (const entry of eventEntries) {
      const event = JSON.parse(entry.text);
      console.log(`  - ${entry.id}: ${event.topic} at ${new Date(event.ts).toISOString()}`);
    }

    // 5. Test CLI events list
    console.log('\n🔧 Testing CLI events list...');
    const { list } = await import('./packages/opencode-client/dist/actions/events/list.js');

    const result = await list({
      client: null, // Mock client to test dual store only
    });

    console.log('CLI Events List Result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testEvents();
