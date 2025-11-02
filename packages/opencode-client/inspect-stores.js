#!/usr/bin/env node

// Manual inspection script for dual stores contents
import { initializeStores } from './dist/initializeStores.js';
import { sessionStore, eventStore, messageStore } from './dist/stores.js';

async function inspectStores() {
  console.log('🔍 Initializing stores...\n');

  try {
    await initializeStores();
    console.log('✅ Stores initialized successfully\n');
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    process.exit(1);
  }

  // Inspect session store
  console.log('📁 SESSION STORE CONTENTS:');
  console.log('='.repeat(50));
  try {
    const sessions = await sessionStore.getMostRecent(20);
    console.log(`Total sessions found: ${sessions.length}\n`);

    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ID: ${session.id}`);
      console.log(`   Timestamp: ${new Date(session.timestamp).toISOString()}`);
      console.log(`   Text preview: ${session.text.substring(0, 100)}...`);
      console.log('');
    });
  } catch (error) {
    console.error('Error reading session store:', error);
  }

  // Inspect event store
  console.log('\n📁 EVENT STORE CONTENTS:');
  console.log('='.repeat(50));
  try {
    const events = await eventStore.getMostRecent(20);
    console.log(`Total events found: ${events.length}\n`);

    events.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id}`);
      console.log(`   Timestamp: ${new Date(event.timestamp).toISOString()}`);
      console.log(`   Text preview: ${event.text.substring(0, 100)}...`);
      console.log('');
    });
  } catch (error) {
    console.error('Error reading event store:', error);
  }

  // Inspect message store
  console.log('\n📁 MESSAGE STORE CONTENTS:');
  console.log('='.repeat(50));
  try {
    const messages = await messageStore.getMostRecent(20);
    console.log(`Total messages found: ${messages.length}\n`);

    messages.forEach((message, index) => {
      console.log(`${index + 1}. ID: ${message.id}`);
      console.log(`   Timestamp: ${new Date(message.timestamp).toISOString()}`);
      console.log(`   Text preview: ${message.text.substring(0, 100)}...`);
      console.log('');
    });
  } catch (error) {
    console.error('Error reading message store:', error);
  }

  // Store statistics
  console.log('\n📊 STORE STATISTICS:');
  console.log('='.repeat(50));

  try {
    // Try different count methods
    let sessionCount = 'unknown';
    let eventCount = 'unknown';
    let messageCount = 'unknown';

    try {
      if (typeof sessionStore.count === 'function') {
        sessionCount = await sessionStore.count();
      } else if (typeof sessionStore.size === 'function') {
        sessionCount = await sessionStore.size();
      } else {
        // Get all entries and count them
        const allSessions = await sessionStore.getMostRecent(1000);
        sessionCount = allSessions.length;
      }
    } catch (e) {
      console.log('Could not get session count:', e.message);
    }

    try {
      if (typeof eventStore.count === 'function') {
        eventCount = await eventStore.count();
      } else if (typeof eventStore.size === 'function') {
        eventCount = await eventStore.size();
      } else {
        const allEvents = await eventStore.getMostRecent(1000);
        eventCount = allEvents.length;
      }
    } catch (e) {
      console.log('Could not get event count:', e.message);
    }

    try {
      if (typeof messageStore.count === 'function') {
        messageCount = await messageStore.count();
      } else if (typeof messageStore.size === 'function') {
        messageCount = await messageStore.size();
      } else {
        const allMessages = await messageStore.getMostRecent(1000);
        messageCount = allMessages.length;
      }
    } catch (e) {
      console.log('Could not get message count:', e.message);
    }

    console.log(`Sessions: ${sessionCount} total`);
    console.log(`Events: ${eventCount} total`);
    console.log(`Messages: ${messageCount} total`);
  } catch (error) {
    console.error('Error getting store counts:', error);
  }

  console.log('\n🔍 Inspection complete.');
}

inspectStores().catch(console.error);
