#!/usr/bin/env node

import { DualStoreManager } from '@promethean/persistence';
import {
  sessionStore,
  agentTaskStore,
  initializeStores,
} from './packages/opencode-client/dist/index.js';

async function testEventStorage() {
  console.log('🧪 Testing Event Storage in Dual Store...\n');

  try {
    // 1. Initialize stores
    console.log('🔧 Initializing dual stores...');
    const testStore = await DualStoreManager.create('duck_events_test', 'text', 'timestamp');
    const testAgentStore = await DualStoreManager.create(
      'duck_events_agent_test',
      'text',
      'timestamp',
    );

    initializeStores(testStore, testAgentStore);
    console.log('✅ Stores initialized');

    // 2. Create some test events
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

    console.log('\n📝 Storing test events...');
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

    // 3. Test retrieving events
    console.log('\n📋 Retrieving events from dual store...');
    const entries = await sessionStore.getMostRecent(10);
    const eventEntries = entries.filter((entry) => entry.id && entry.id.startsWith('event:'));

    console.log(`Found ${eventEntries.length} events:`);
    for (const entry of eventEntries) {
      const event = JSON.parse(entry.text);
      console.log(`  - ${entry.id}: ${event.type} at ${event.timestamp}`);
    }

    // 4. Test CLI events list
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
      console.error('Stack:', error.stack);
    }

    // 5. Test actual CLI command
    console.log('\n🖥️  Testing actual CLI events command...');
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);

      const { stdout, stderr } = await execAsync(
        'node packages/opencode-client/dist/cli.js events list --limit 5 --json',
      );
      console.log('CLI stdout:', stdout);
      if (stderr) console.log('CLI stderr:', stderr);
    } catch (error) {
      console.error('❌ CLI command failed:', error.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testEventStorage();
