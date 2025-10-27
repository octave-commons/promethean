import { MongoClient } from 'mongodb';
import { ChromaClient } from 'chromadb';
const MONGO_URI = process.env.MONGODB_URI ?? process.env.MCP_MONGO_URI ?? 'mongodb://localhost:27017';
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000';
const mongoClientOverrides = new Map();
const mongoClientPromises = new Map();
const chromaClientOverrides = new Map();
const chromaClientPromises = new Map();
const createMongoClient = async () => {
    console.log(`[MongoDB Client] Connecting to URI: ${MONGO_URI}`);
    // Create connection with more conservative settings to avoid connection issues
    const client = new MongoClient(MONGO_URI, {
        maxPoolSize: 1, // Use single connection to avoid pool complexity
        minPoolSize: 1, // Maintain exactly 1 connection
        maxIdleTimeMS: 30000, // Keep connections alive longer
        serverSelectionTimeoutMS: 10000, // Longer timeout for more stability
        socketTimeoutMS: 0, // No socket timeout - let connection persist
        connectTimeoutMS: 10000, // Longer connection timeout
        heartbeatFrequencyMS: 10000, // Check connection health less frequently
        retryWrites: true,
        retryReads: true,
        // Additional stability options
        maxConnecting: 1, // Limit concurrent connection attempts
        waitQueueTimeoutMS: 10000, // Timeout for waiting in queue
    });
    await client.connect();
    // Verify connection is actually established with multiple checks
    await client.db('admin').command({ ping: 1 });
    // Additional validation: try a simple operation on the target database
    const testDb = client.db('database');
    const testCollection = testDb.collection('connection_test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    await testCollection.deleteOne({ test: true });
    // Final verification: ensure we can perform a read operation
    await testDb.collection('connection_test').countDocuments();
    return client;
};
// Helper function to validate and refresh MongoDB connection if needed
export const validateMongoConnection = async (client) => {
    try {
        // Quick ping to check if connection is alive
        await client.db('admin').command({ ping: 1 });
        return client;
    }
    catch (error) {
        console.log('[MongoDB Client] Connection validation failed, creating fresh connection...');
        // Close the existing client
        try {
            await client.close();
        }
        catch (closeError) {
            console.log('[MongoDB Client] Error closing existing client:', closeError);
        }
        // Create and return a fresh connection
        return createMongoClient();
    }
};
const createChromaClient = async () => new ChromaClient({ path: CHROMA_URL });
const getFromCache = async (promiseCache, overrides, cacheKey, factory) => {
    const override = overrides.get(cacheKey);
    if (override) {
        return override;
    }
    const existingPromise = promiseCache.get(cacheKey);
    if (existingPromise) {
        return existingPromise;
    }
    const createdPromise = factory();
    promiseCache.set(cacheKey, createdPromise);
    return createdPromise;
};
export const getMongoClient = async () => {
    const client = await getFromCache(mongoClientPromises, mongoClientOverrides, 'mongo', createMongoClient);
    // Validate connection before returning
    try {
        await client.db('admin').command({ ping: 1 });
        return client;
    }
    catch (error) {
        console.log('[MongoDB Client] Cached connection invalid, creating fresh connection...');
        // Clear the cached promise and client
        mongoClientPromises.delete('mongo');
        mongoClientOverrides.delete('mongo');
        // Close the existing client
        try {
            await client.close();
        }
        catch (closeError) {
            console.log('[MongoDB Client] Error closing invalid client:', closeError);
        }
        // Create and return a fresh connection
        return getFromCache(mongoClientPromises, mongoClientOverrides, 'mongo', createMongoClient);
    }
};
export const getChromaClient = async () => getFromCache(chromaClientPromises, chromaClientOverrides, 'chroma', createChromaClient);
const setOverride = (overrides, promiseCache, cacheKey, client) => {
    if (client === null) {
        overrides.delete(cacheKey);
        promiseCache.delete(cacheKey);
        return;
    }
    overrides.set(cacheKey, client);
    promiseCache.delete(cacheKey);
};
// BOT: Test hooks to override clients in unit tests without network dependency.
// Not for production use.
// AUTHOR: I do not like test logic getting mixed in with business logic
export const __setMongoClientForTests = (client) => setOverride(mongoClientOverrides, mongoClientPromises, 'mongo', client);
export const __setChromaClientForTests = (client) => setOverride(chromaClientOverrides, chromaClientPromises, 'chroma', client);
export const __resetPersistenceClientsForTests = () => {
    mongoClientOverrides.clear();
    chromaClientOverrides.clear();
    mongoClientPromises.clear();
    chromaClientPromises.clear();
};
export const cleanupClients = async () => {
    try {
        // Shutdown all Chroma write queues
        const { shutdownAllQueues } = await import('./chroma-write-queue.js');
        await shutdownAllQueues();
    }
    catch (error) {
        // Ignore cleanup errors
    }
    try {
        const mongoClient = await mongoClientPromises.get('mongo');
        if (mongoClient) {
            await mongoClient.close();
        }
    }
    catch (error) {
        // Ignore cleanup errors
    }
    mongoClientOverrides.clear();
    chromaClientOverrides.clear();
    mongoClientPromises.clear();
    chromaClientPromises.clear();
};
