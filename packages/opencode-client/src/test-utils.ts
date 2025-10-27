import { getMongoClient, cleanupClients } from '@promethean-os/persistence';
import { contextStore } from './stores.js';

/**
 * Logging utility that respects LOG_LEVEL environment variable
 */
const testLog = {
  debug: (message: any, ...args: any[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.error(message, ...args);
    }
  },
  info: (message: any, ...args: any[]) => {
    if (process.env.LOG_LEVEL && ['debug', 'info'].includes(process.env.LOG_LEVEL)) {
      console.error(message, ...args);
    }
  },
  error: (message: any, ...args: any[]) => {
    if (process.env.LOG_LEVEL && ['debug', 'info', 'error'].includes(process.env.LOG_LEVEL)) {
      console.error(message, ...args);
    }
  },
};

/**
 * Shared test cleanup utility to clear all test data
 */
export async function cleanupTestData(): Promise<void> {
  try {
    testLog.debug('🧹 Starting test cleanup...');

    // Clear all collections from context store
    const collectionNames = contextStore.listCollectionNames();
    testLog.debug('📋 Found collections:', collectionNames);

    for (const collectionName of collectionNames) {
      const collection = contextStore.getCollection(collectionName);
      if (collection && 'clear' in collection && typeof collection.clear === 'function') {
        await collection.clear();
        testLog.debug(`✅ Cleared context store collection: ${collectionName}`);
      }
    }

    // Also clear directly from MongoDB for thorough cleanup
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('database');

    // Get all collection names in the database
    const allCollections = await db.listCollections().toArray();
    const collectionNamesFromDb = allCollections.map((c) => c.name);
    testLog.debug('🗃️ Found DB collections:', collectionNamesFromDb);

    // Drop ALL collections that might contain test data
    for (const collectionName of collectionNamesFromDb) {
      try {
        await db.collection(collectionName).drop();
        testLog.debug(`🗑️ Dropped DB collection: ${collectionName}`);
      } catch (error) {
        // Ignore collection not found errors
        if ((error as any).codeName !== 'NamespaceNotFound') {
          testLog.error(`⚠️ Could not drop ${collectionName}:`, error);
        }
      }
    }

    await mongoClient.close();

    // Also cleanup persistence clients to ensure no hanging connections
    await cleanupClients();
    testLog.debug('✅ Test cleanup completed');
  } catch (error) {
    testLog.error('❌ Test cleanup failed:', error);
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
