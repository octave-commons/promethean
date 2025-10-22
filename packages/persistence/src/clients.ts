import { MongoClient } from 'mongodb';
import { ChromaClient } from 'chromadb';

const MONGO_URI = process.env.MONGODB_URI ?? process.env.MCP_MONGO_URI ?? 'mongodb://localhost:27017';
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000';

type PromiseCache<TClient> = Map<string, Promise<TClient>>;
type OverrideCache<TClient> = Map<string, TClient>;

const mongoClientOverrides: OverrideCache<MongoClient> = new Map();
const mongoClientPromises: PromiseCache<MongoClient> = new Map();

const chromaClientOverrides: OverrideCache<ChromaClient> = new Map();
const chromaClientPromises: PromiseCache<ChromaClient> = new Map();

const createMongoClient = async (): Promise<MongoClient> => {
    console.log(`[MongoDB Client] Connecting to URI: ${MONGO_URI}`);
    // Create connection with minimal pooling to avoid connection issues
    const client = new MongoClient(MONGO_URI, {
        maxPoolSize: 1, // Use single connection to avoid pool complexity
        minPoolSize: 1, // Maintain exactly 1 connection
        maxIdleTimeMS: 10000, // Close idle connections quickly
        serverSelectionTimeoutMS: 5000, // Shorter timeout to fail fast
        socketTimeoutMS: 10000, // Shorter socket timeout
        connectTimeoutMS: 5000, // Shorter connection timeout
        heartbeatFrequencyMS: 5000, // Check connection health more frequently
        retryWrites: true,
        retryReads: true,
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

const createChromaClient = async (): Promise<ChromaClient> => new ChromaClient({ path: CHROMA_URL });

const getFromCache = async <TClient>(
    promiseCache: PromiseCache<TClient>,
    overrides: OverrideCache<TClient>,
    cacheKey: string,
    factory: () => Promise<TClient>,
): Promise<TClient> => {
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

export const getMongoClient = async (): Promise<MongoClient> =>
    getFromCache(mongoClientPromises, mongoClientOverrides, 'mongo', createMongoClient);

export const getChromaClient = async (): Promise<ChromaClient> =>
    getFromCache(chromaClientPromises, chromaClientOverrides, 'chroma', createChromaClient);

const setOverride = <TClient>(
    overrides: OverrideCache<TClient>,
    promiseCache: PromiseCache<TClient>,
    cacheKey: string,
    client: TClient | null,
): void => {
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
export const __setMongoClientForTests = (client: MongoClient | null): void =>
    setOverride(mongoClientOverrides, mongoClientPromises, 'mongo', client);

export const __setChromaClientForTests = (client: ChromaClient | null): void =>
    setOverride(chromaClientOverrides, chromaClientPromises, 'chroma', client);

export const __resetPersistenceClientsForTests = (): void => {
    mongoClientOverrides.clear();

    chromaClientOverrides.clear();

    mongoClientPromises.clear();

    chromaClientPromises.clear();
};

export const cleanupClients = async (): Promise<void> => {
    try {
        const mongoClient = await mongoClientPromises.get('mongo');
        if (mongoClient) {
            await mongoClient.close();
        }
    } catch (error) {
        // Ignore cleanup errors
    }

    mongoClientOverrides.clear();

    chromaClientOverrides.clear();

    mongoClientPromises.clear();

    chromaClientPromises.clear();
};
