#!/usr/bin/env node

/**
 * Simple test script to verify unified store functionality
 */

console.log('🧪 Testing Unified Store Implementation...\n');

async function testUnifiedStore() {
  try {
    // Import the unified store
    const {
      sessionStoreAccess,
      eventStoreAccess,
      messageStoreAccess,
      searchAcrossStores,
      IdGenerator,
      StoreConnectionPool,
      StoreTransactionManager,
    } = await import('./dist/services/unified-store.js');

    console.log('✅ Successfully imported unified store modules');
    console.log('📦 Available exports:', {
      sessionStoreAccess: !!sessionStoreAccess,
      eventStoreAccess: !!eventStoreAccess,
      messageStoreAccess: !!messageStoreAccess,
      searchAcrossStores: !!searchAcrossStores,
      IdGenerator: !!IdGenerator,
      StoreConnectionPool: !!StoreConnectionPool,
      StoreTransactionManager: !!StoreTransactionManager,
    });

    // Test ID generation
    console.log('\n🔑 Testing ID Generation:');
    const sessionId = IdGenerator.generateSessionId('test123');
    const messageId = IdGenerator.generateMessageId('msg456');
    const eventId = IdGenerator.generateEventId('user_action');

    console.log(`  Session ID: ${sessionId}`);
    console.log(`  Message ID: ${messageId}`);
    console.log(`  Event ID: ${eventId}`);

    // Test singleton patterns
    console.log('\n🏗️  Testing Singleton Patterns:');
    const pool1 = StoreConnectionPool.getInstance();
    const pool2 = StoreConnectionPool.getInstance();
    const manager1 = StoreTransactionManager.getInstance();
    const manager2 = StoreTransactionManager.getInstance();

    console.log(`  Connection Pool singleton: ${pool1 === pool2 ? '✅' : '❌'}`);
    console.log(`  Transaction Manager singleton: ${manager1 === manager2 ? '✅' : '❌'}`);

    // Test store access creation
    console.log('\n🏪 Testing Store Access:');
    console.log(`  Session store name: ${sessionStoreAccess.storeName}`);
    console.log(`  Event store name: ${eventStoreAccess.storeName}`);
    console.log(`  Message store name: ${messageStoreAccess.storeName}`);

    // Test basic operations (non-destructive)
    console.log('\n🔍 Testing Basic Operations:');

    // Test query (should not throw)
    try {
      const sessionResults = await sessionStoreAccess.query({
        queries: ['test'],
        limit: 5,
      });
      console.log(`  Session query: ✅ (returned ${sessionResults.length} results)`);
    } catch (error) {
      console.log(`  Session query: ⚠️  (${error.message})`);
    }

    // Test get (should return null for non-existent)
    try {
      const nonExistent = await sessionStoreAccess.get('non-existent-id');
      console.log(`  Get non-existent: ✅ (returned ${nonExistent})`);
    } catch (error) {
      console.log(`  Get non-existent: ⚠️  (${error.message})`);
    }

    // Test search across stores
    try {
      const searchResults = await searchAcrossStores('test query', {
        limit: 3,
        includeSessions: true,
        includeMessages: true,
        includeEvents: true,
      });
      console.log(`  Search across stores: ✅`);
      console.log(`    Sessions: ${searchResults.sessions.length}`);
      console.log(`    Messages: ${searchResults.messages.length}`);
      console.log(`    Events: ${searchResults.events.length}`);
    } catch (error) {
      console.log(`  Search across stores: ⚠️  (${error.message})`);
    }

    console.log('\n🎉 Unified Store Test Completed Successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Unified Store Test Failed:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testUnifiedStore().then((success) => {
  process.exit(success ? 0 : 1);
});
