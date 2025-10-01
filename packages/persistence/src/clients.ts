import { MongoClient } from 'mongodb';
import { ChromaClient } from 'chromadb';

const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000';

type PromiseCache<TClient> = Map<string, Promise<TClient>>;
type OverrideCache<TClient> = Map<string, TClient>;

const mongoClientOverrides: OverrideCache<MongoClient> = new Map();
const mongoClientPromises: PromiseCache<MongoClient> = new Map();

const chromaClientOverrides: OverrideCache<ChromaClient> = new Map();
const chromaClientPromises: PromiseCache<ChromaClient> = new Map();

const createMongoClient = async (): Promise<MongoClient> => {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
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
