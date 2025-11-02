#!/usr/bin/env node

// Aggressive cleanup script for test data
import { getMongoClient } from '@promethean-os/persistence';

async function cleanupTestData() {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('database');

    // Clear all test collections aggressively
    const collections = [
      'test_agent_sessionStore',
      'test_agent_eventStore',
      'test_agent_messageStore',
      'sessionStore',
      'eventStore',
      'messageStore',
    ];

    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`Cleared ${collectionName}, deleted ${result.deletedCount} documents`);
    }

    await mongoClient.close();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupTestData();
