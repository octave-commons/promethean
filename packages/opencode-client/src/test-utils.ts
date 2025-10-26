import { getMongoClient, cleanupClients } from '@promethean-os/persistence';
import { contextStore } from './stores.js';

/**
 * Shared test cleanup utility to clear all test data
 */
export async function cleanupTestData(): Promise<void> {
  try {
    // Clear all collections from context store
    const collectionNames = contextStore.listCollectionNames();

    for (const collectionName of collectionNames) {
      const collection = contextStore.getCollection(collectionName);
      if (collection && 'clear' in collection && typeof collection.clear === 'function') {
        await collection.clear();
      }
    }

    // Also clear directly from MongoDB for thorough cleanup
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('database');

    const collections = [
      'sessionStore',
      'eventStore',
      'messageStore',
      'test_agent_sessionStore',
      'test_agent_eventStore',
      'test_agent_messageStore',
    ];

    for (const collectionName of collections) {
      try {
        // More aggressive cleanup - drop the entire collection
        await db.collection(collectionName).drop();
        if (process.env.VERBOSE_TESTS === 'true') {
          console.error(`Dropped ${collectionName} collection`);
        }
      } catch (error) {
        // Ignore collection not found errors
        if ((error as any).codeName !== 'NamespaceNotFound') {
          if (process.env.VERBOSE_TESTS === 'true') {
            console.error(`Warning: Could not drop ${collectionName}:`, error);
          }
        }
      }
    }

    await mongoClient.close();

    // Also cleanup persistence clients to ensure no hanging connections
    await cleanupClients();
  } catch (error) {
    if (process.env.VERBOSE_TESTS === 'true') {
      console.error('Test cleanup failed:', error);
    }
    throw error;
  }
}

/**
 * Setup and teardown utilities for tests
 */
export const testUtils = {
  cleanupTestData,

  /**
   * Run cleanup before each test to ensure clean state
   */
  beforeEach: async () => {
    await cleanupTestData();
  },

  /**
   * Run cleanup after each test (always runs even if test fails)
   */
  afterEach: async () => {
    await cleanupTestData();
  },
};
