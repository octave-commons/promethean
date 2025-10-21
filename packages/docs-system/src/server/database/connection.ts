/**
 * Database connection and configuration for MongoDB
 */

import { MongoClient, Db, Collection, Document } from 'mongodb';
import { ConfigManager, Logger } from '../../shared/index.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    const config = ConfigManager.getInstance();
    const dbConfig = config.getDatabaseConfig();

    const logger = Logger.getInstance();
    logger.info('Connecting to MongoDB...', {
      url: dbConfig.url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      database: dbConfig.name,
    });

    client = new MongoClient(dbConfig.url, {
      maxPoolSize: dbConfig.options.maxPoolSize,
      minPoolSize: dbConfig.options.minPoolSize,
      maxIdleTimeMS: dbConfig.options.maxIdleTimeMS,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db(dbConfig.name);

    // Test the connection
    await db.admin().ping();

    logger.info('MongoDB connected successfully');

    // Create indexes for better performance
    await createIndexes();

    return db;
  } catch (error) {
    const logger = Logger.getInstance();
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    const logger = Logger.getInstance();
    logger.info('MongoDB disconnected');
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return db;
}

export function getCollection<T extends Document>(name: string): Collection<T> {
  return getDatabase().collection<T>(name);
}

async function createIndexes(): Promise<void> {
  const database = getDatabase();

  try {
    // Users collection indexes
    const usersCollection = database.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ createdAt: 1 });

    // Documents collection indexes
    const documentsCollection = database.collection('documents');
    await documentsCollection.createIndex({ title: 'text', content: 'text' });
    await documentsCollection.createIndex({ authorId: 1 });
    await documentsCollection.createIndex({ tags: 1 });
    await documentsCollection.createIndex({ createdAt: -1 });
    await documentsCollection.createIndex({ updatedAt: -1 });

    // Queries collection indexes
    const queriesCollection = database.collection('queries');
    await queriesCollection.createIndex({ userId: 1 });
    await queriesCollection.createIndex({ status: 1 });
    await queriesCollection.createIndex({ createdAt: -1 });
    await queriesCollection.createIndex({ jobId: 1 });

    // Ollama jobs collection indexes
    const ollamaJobsCollection = database.collection('ollama_jobs');
    await ollamaJobsCollection.createIndex({ jobId: 1 }, { unique: true });
    await ollamaJobsCollection.createIndex({ userId: 1 });
    await ollamaJobsCollection.createIndex({ status: 1 });
    await ollamaJobsCollection.createIndex({ createdAt: -1 });
    await ollamaJobsCollection.createIndex({ priority: -1 });

    const logger = Logger.getInstance();
    logger.info('Database indexes created successfully');
  } catch (error) {
    const logger = Logger.getInstance();
    logger.error('Failed to create database indexes', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details?: any;
}> {
  try {
    const database = getDatabase();
    const admin = database.admin();
    const result = await admin.ping();

    if (result.ok === 1) {
      return { status: 'healthy' };
    } else {
      return { status: 'unhealthy', details: result };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}
