#!/usr/bin/env node

/**
 * Test script to verify dual store event persistence
 */

import { DualStoreManager } from '@promethean/persistence';
import { initializeStores } from './dist/index.js';

async function testEventPersistence() {
  console.log('🧪 Testing dual store event persistence...');

  try {
    // Initialize stores
    const testSessionStore = await DualStoreManager.create('test-events', 'text', 'timestamp');
    const testAgentTaskStore = await DualStoreManager.create(
      'test-agent-tasks',
      'text',
      'timestamp',
    );

    initializeStores(testSessionStore, testAgentTaskStore);
    console.log('✅ Stores initialized');

    // Create test events
    const testEvents = [
      {
        id: 'event:test-1',
        type: 'session.updated',
        sessionId: 'test-session-123',
        timestamp: new Date().toISOString(),
        content: 'Test session updated event',
        properties: { test: true },
      },
      {
        id: 'event:test-2',
        type: 'message.sent',
        sessionId: 'test-session-456',
        timestamp: new Date().toISOString(),
        content: 'Test message sent event',
        properties: { test: true },
      },
      {
        id: 'event:test-3',
        type: 'tool_call',
        sessionId: 'test-session-123',
        timestamp: new Date().toISOString(),
        content: 'Test tool call event',
        properties: { test: true, tool: 'test-tool' },
      },
    ];

    // Store events
    console.log('📝 Storing test events...');
    for (const event of testEvents) {
      await testSessionStore.insert({
        id: event.id,
        text: JSON.stringify(event),
        timestamp: new Date().toISOString(),
      });
      console.log(`  ✅ Stored ${event.id}`);
    }

    // Retrieve and verify events
    console.log('🔍 Retrieving events...');
    const storedEntries = await testSessionStore.getMostRecent(10);
    const eventEntries = storedEntries
      .filter((entry) => entry.id && entry.id.startsWith('event:'))
      .map((entry) => ({
        ...JSON.parse(entry.text),
        _id: entry.id,
        _timestamp: entry.timestamp,
      }));

    console.log(`📊 Found ${eventEntries.length} events:`);
    eventEntries.forEach((event) => {
      console.log(`  - ${event.type} (${event.sessionId}) at ${event._timestamp}`);
    });

    // Verify all test events are present
    const foundEventIds = eventEntries.map((e) => e._id);
    const expectedEventIds = testEvents.map((e) => e.id);
    const missingEvents = expectedEventIds.filter((id) => !foundEventIds.includes(id));

    if (missingEvents.length === 0) {
      console.log('✅ All test events found and persisted correctly!');
    } else {
      console.log(`❌ Missing events: ${missingEvents.join(', ')}`);
    }

    // Test filtering by type
    console.log('🔍 Testing type filtering...');
    const toolCallEvents = eventEntries.filter((e) => e.type === 'tool_call');
    console.log(`  Found ${toolCallEvents.length} tool_call events`);

    // Test filtering by session
    console.log('🔍 Testing session filtering...');
    const session123Events = eventEntries.filter((e) => e.sessionId === 'test-session-123');
    console.log(`  Found ${session123Events.length} events for test-session-123`);

    console.log('✅ Event persistence test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testEventPersistence();
