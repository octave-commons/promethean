import { getMongoClient, cleanupClients } from '@promethean-os/persistence';
import { contextStore } from './stores.js';

/**
 * Shared test cleanup utility to clear all test data
 */
export async function cleanupTestData(): Promise<void> {
  try {
    console.error('🧹 Starting test cleanup...');

    // Clear all collections from context store
    const collectionNames = contextStore.listCollectionNames();
    console.error('📋 Found collections:', collectionNames);

    for (const collectionName of collectionNames) {
      const collection = contextStore.getCollection(collectionName);
      if (collection && 'clear' in collection && typeof collection.clear === 'function') {
        await collection.clear();
        console.error(`✅ Cleared context store collection: ${collectionName}`);
      }
    }

    // Also clear directly from MongoDB for thorough cleanup
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('database');

    // Get all collection names in the database
    const allCollections = await db.listCollections().toArray();
    const collectionNamesFromDb = allCollections.map((c) => c.name);
    console.error('🗃️ Found DB collections:', collectionNamesFromDb);

    // Drop ALL collections that might contain test data
    for (const collectionName of collectionNamesFromDb) {
      try {
        await db.collection(collectionName).drop();
        console.error(`🗑️ Dropped DB collection: ${collectionName}`);
      } catch (error) {
        // Ignore collection not found errors
        if ((error as any).codeName !== 'NamespaceNotFound') {
          console.error(`⚠️ Could not drop ${collectionName}:`, error);
        }
      }
    }

    await mongoClient.close();

    // Also cleanup persistence clients to ensure no hanging connections
    await cleanupClients();
    console.error('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
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
