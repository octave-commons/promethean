import type { Collection as ChromaCollection } from 'chromadb';

import { RemoteEmbeddingFunction } from '@promethean-os/embedding';
import type { Collection, OptionalUnlessRequiredId, WithId } from 'mongodb';

import { randomUUID } from 'node:crypto';
import type { DualStoreEntry, AliasDoc, DualStoreMetadata } from './types.js';
import { getChromaClient, getMongoClient, validateMongoConnection } from './clients.js';
import { getOrCreateQueue } from './chroma-write-queue.js';

export class DualStoreManager<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> {
    name: string;
    chromaCollection: ChromaCollection;
    mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>;
    textKey: TextKey;
    timeStampKey: TimeKey;
    supportsImages: boolean;
    private chromaWriteQueue: ReturnType<typeof getOrCreateQueue>;

    constructor(
        name: string,
        chromaCollection: ChromaCollection,
        mongoCollection: Collection<DualStoreEntry<TextKey, TimeKey>>,
        textKey: TextKey,
        timeStampKey: TimeKey,
        supportsImages = false,
    ) {
        this.name = name;
        this.chromaCollection = chromaCollection;
        this.mongoCollection = mongoCollection;
        this.textKey = textKey;
        this.timeStampKey = timeStampKey;
        this.supportsImages = supportsImages;
        this.chromaWriteQueue = getOrCreateQueue(name, chromaCollection);
    }

    static async create<TTextKey extends string = 'text', TTimeKey extends string = 'createdAt'>(
        name: string,
        textKey: TTextKey,
        timeStampKey: TTimeKey,
    ) {
        const chromaClient = await getChromaClient();
        const mongoClient = await getMongoClient();
        const family = `${process.env.AGENT_NAME || 'duck'}_${name}`;
        const db = mongoClient.db('database');
        const aliases = db.collection<AliasDoc>('collection_aliases');
        const alias = await aliases.findOne({ _id: family });

        const embedFnName = alias?.embed?.fn || process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
        const embeddingFn = alias?.embed
            ? RemoteEmbeddingFunction.fromConfig({
                  driver: alias.embed.driver,
                  fn: alias.embed.fn,
              })
            : RemoteEmbeddingFunction.fromConfig({
                  driver: process.env.EMBEDDING_DRIVER || 'ollama',
                  fn: embedFnName,
              });

        const chromaCollection = await chromaClient.getOrCreateCollection({
            name: alias?.target || family,
            embeddingFunction: embeddingFn,
        });

        const mongoCollection = db.collection<DualStoreEntry<TTextKey, TTimeKey>>(family);

        const supportsImages = !embedFnName.toLowerCase().includes('text');
        return new DualStoreManager(family, chromaCollection, mongoCollection, textKey, timeStampKey, supportsImages);
    }

    async insert(entry: DualStoreEntry<TextKey, TimeKey>) {
        const id = entry.id ?? randomUUID();
        const timestamp =
            entry[this.timeStampKey] || (Date.now() as unknown as DualStoreEntry<TextKey, TimeKey>[TimeKey]);

        // Create mutable copy to work with readonly types
        const mutableEntry = {
            ...entry,
            id,
            [this.timeStampKey]: timestamp,
            metadata: {
                ...entry.metadata,
                [this.timeStampKey]: timestamp,
            },
        };

        // console.log("Adding entry to collection", this.name, entry);

        const dualWrite = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
        const isImage = mutableEntry.metadata?.type === 'image';
        let vectorWriteSuccess = true;
        let vectorWriteError: Error | null = null;

        if (dualWrite && (!isImage || this.supportsImages)) {
            try {
                // Flatten metadata for ChromaDB compatibility (only primitive values allowed)
                const chromaMetadata: Record<string, string | number | boolean | null> = {};
                if (mutableEntry.metadata) {
                    for (const [key, value] of Object.entries(mutableEntry.metadata)) {
                        if (value === null || value === undefined) {
                            chromaMetadata[key] = null;
                        } else if (
                            typeof value === 'string' ||
                            typeof value === 'number' ||
                            typeof value === 'boolean'
                        ) {
                            chromaMetadata[key] = value;
                        } else {
                            // Convert objects to JSON strings for ChromaDB compatibility
                            chromaMetadata[key] = JSON.stringify(value);
                        }
                    }
                }

                // Use write queue for batching instead of direct write
                await this.chromaWriteQueue.add(id, mutableEntry[this.textKey], chromaMetadata);
            } catch (e) {
                vectorWriteSuccess = false;
                vectorWriteError = e instanceof Error ? e : new Error(String(e));

                // Log detailed error information
                console.error('Vector store write failed for entry', {
                    id,
                    collection: this.name,
                    error: vectorWriteError.message,
                    stack: vectorWriteError.stack,
                    metadata: mutableEntry.metadata,
                });

                // Determine if this is a critical failure based on configuration
                const consistencyLevel = process.env.DUAL_WRITE_CONSISTENCY || 'eventual';
                if (consistencyLevel === 'strict') {
                    throw new Error(`Critical: Vector store write failed for entry ${id}: ${vectorWriteError.message}`);
                }
            }
        }

        // Ensure MongoDB connection is valid before inserting
        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        // Add consistency metadata to track vector write status
        const enhancedMetadata: DualStoreMetadata = {
            ...mutableEntry.metadata,
            vectorWriteSuccess,
            vectorWriteError: vectorWriteError?.message,
            vectorWriteTimestamp: vectorWriteSuccess ? Date.now() : null,
        };

        await collection.insertOne({
            id: mutableEntry.id,
            [this.textKey]: mutableEntry[this.textKey],
            [this.timeStampKey]: mutableEntry[this.timeStampKey],
            metadata: enhancedMetadata,
        } as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>);
    }

    // TODO: remove in future – alias for backwards compatibility
    async addEntry(entry: DualStoreEntry<TextKey, TimeKey>) {
        return this.insert(entry);
    }

    async getMostRecent(
        limit: number = 10,
        mongoFilter: any = { [this.textKey]: { $nin: [null, ''], $not: /^\s*$/ } },
        sorter: any = { [this.timeStampKey]: -1 },
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        // console.log("Getting most recent entries from collection", this.name, "with limit", limit);

        // Ensure MongoDB connection is valid before querying
        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        return (await collection.find(mongoFilter).sort(sorter).limit(limit).toArray()).map(
            (entry: WithId<DualStoreEntry<TextKey, TimeKey>>) => ({
                id: entry.id,
                text: (entry as Record<TextKey, any>)[this.textKey],
                timestamp: new Date((entry as Record<TimeKey, any>)[this.timeStampKey]).getTime(),
                metadata: entry.metadata,
            }),
        ) as DualStoreEntry<'text', 'timestamp'>[];
    }
    async getMostRelevant(
        queryTexts: string[],
        limit: number,
        where: Record<string, unknown> = {},
    ): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
        // console.log("Getting most relevant entries from collection", this.name, "for queries", queryTexts, "with limit", limit);
        if (!queryTexts || queryTexts.length === 0) return Promise.resolve([]);

        const query: Record<string, any> = {
            queryTexts,
            nResults: limit,
        };
        if (where && Object.keys(where).length > 0) query.where = where;
        const queryResult = await this.chromaCollection.query(query);
        const uniqueThoughts = new Set();
        const ids = queryResult.ids.flat(2);
        const meta = queryResult.metadatas.flat(2);
        return queryResult.documents
            .flat(2)
            .map((doc, i) => ({
                id: ids[i],
                text: doc,
                metadata: meta[i],
                timestamp: meta[i]?.timeStamp || meta[i]?.[this.timeStampKey] || Date.now(),
            }))
            .filter((doc) => {
                if (!doc.text) return false; // filter out undefined text
                if (uniqueThoughts.has(doc.text)) return false; // filter out duplicates
                uniqueThoughts.add(doc.text);
                return true;
            }) as DualStoreEntry<'text', 'timestamp'>[];
    }

    async get(id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
        const filter = { id } as any;

        // Ensure MongoDB connection is valid before querying
        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        const document = await collection.findOne(filter);

        if (!document) {
            return null;
        }

        return {
            id: document.id,
            text: (document as any)[this.textKey],
            timestamp: new Date((document as any)[this.timeStampKey]).getTime(),
            metadata: document.metadata,
        } as DualStoreEntry<'text', 'timestamp'>;
    }

    async checkConsistency(id: string): Promise<{
        hasDocument: boolean;
        hasVector: boolean;
        vectorWriteSuccess?: boolean;
        vectorWriteError?: string;
    }> {
        // Check MongoDB document
        const mongoDoc = await this.get(id);
        const hasDocument = mongoDoc !== null;

        // Check ChromaDB vector
        let hasVector = false;
        try {
            const vectorResult = await this.chromaCollection.get({
                ids: [id],
            });
            hasVector = vectorResult.ids?.length > 0;
        } catch (e) {
            hasVector = false;
        }

        return {
            hasDocument,
            hasVector,
            vectorWriteSuccess: mongoDoc?.metadata?.vectorWriteSuccess,
            vectorWriteError: mongoDoc?.metadata?.vectorWriteError,
        };
    }

    async retryVectorWrite(id: string, maxRetries = 3): Promise<boolean> {
        const mongoDoc = await this.get(id);
        if (!mongoDoc) {
            throw new Error(`Document ${id} not found for vector retry`);
        }

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Flatten metadata for ChromaDB compatibility
                const chromaMetadata: Record<string, string | number | boolean | null> = {};
                if (mongoDoc.metadata) {
                    for (const [key, value] of Object.entries(mongoDoc.metadata)) {
                        if (value === null || value === undefined) {
                            chromaMetadata[key] = null;
                        } else if (
                            typeof value === 'string' ||
                            typeof value === 'number' ||
                            typeof value === 'boolean'
                        ) {
                            chromaMetadata[key] = value;
                        } else {
                            chromaMetadata[key] = JSON.stringify(value);
                        }
                    }
                }

                await this.chromaCollection.add({
                    ids: [id],
                    documents: [mongoDoc.text],
                    metadatas: [chromaMetadata],
                });

                // Update MongoDB to mark vector write as successful
                const mongoClient = await getMongoClient();
                const validatedClient = await validateMongoConnection(mongoClient);
                const db = validatedClient.db('database');
                const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

                await collection.updateOne({ id: id as any }, {
                    $set: {
                        'metadata.vectorWriteSuccess': true,
                        'metadata.vectorWriteError': null,
                        'metadata.vectorWriteTimestamp': Date.now(),
                    },
                } as any);

                console.log(`Vector write retry successful for entry ${id} on attempt ${attempt}`);
                return true;
            } catch (e) {
                lastError = e instanceof Error ? e : new Error(String(e));
                console.warn(`Vector write retry ${attempt} failed for entry ${id}:`, lastError.message);

                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        // All retries failed
        const mongoClient = await getMongoClient();
        const validatedClient = await validateMongoConnection(mongoClient);
        const db = validatedClient.db('database');
        const collection = db.collection<DualStoreEntry<TextKey, TimeKey>>(this.mongoCollection.collectionName);

        await collection.updateOne({ id: id as any }, {
            $set: {
                'metadata.vectorWriteSuccess': false,
                'metadata.vectorWriteError': lastError?.message,
                'metadata.vectorWriteTimestamp': null,
            },
        } as any);

        return false;
    }

    async getConsistencyReport(limit = 100): Promise<{
        totalDocuments: number;
        consistentDocuments: number;
        inconsistentDocuments: number;
        missingVectors: number;
        vectorWriteFailures: Array<{
            id: string;
            error?: string;
            timestamp?: number;
        }>;
    }> {
        const recentDocs = await this.getMostRecent(limit);
        const vectorWriteFailures: Array<{
            id: string;
            error: string;
            timestamp?: number;
        }> = [];

        let consistentDocuments = 0;
        let inconsistentDocuments = 0;
        let missingVectors = 0;

        for (const doc of recentDocs) {
            const vectorWriteSuccess = doc.metadata?.vectorWriteSuccess;
            const vectorWriteError = doc.metadata?.vectorWriteError;

            if (vectorWriteSuccess === true) {
                consistentDocuments++;
            } else if (vectorWriteSuccess === false) {
                inconsistentDocuments++;
                if (vectorWriteError) {
                    vectorWriteFailures.push({
                        id: doc.id || 'unknown',
                        error: vectorWriteError,
                        timestamp: doc.metadata?.vectorWriteTimestamp || undefined,
                    });
                }
            } else {
                // Legacy document without consistency info
                missingVectors++;
            }
        }

        return {
            totalDocuments: recentDocs.length,
            consistentDocuments,
            inconsistentDocuments,
            missingVectors,
            vectorWriteFailures,
        };
    }

    getChromaQueueStats(): {
        queueLength: number;
        processing: boolean;
        config: {
            batchSize: number;
            flushIntervalMs: number;
            maxRetries: number;
            retryDelayMs: number;
            enabled: boolean;
        };
    } {
        return this.chromaWriteQueue.getQueueStats();
    }

    async cleanup(): Promise<void> {
        try {
            // Shutdown Chroma write queue
            await this.chromaWriteQueue.shutdown();

            // Close cached MongoDB connection
            const { cleanupClients } = await import('./clients.js');
            await cleanupClients();
        } catch (error) {
            // Ignore cleanup errors - connection might already be closed
        }
    }
}

// ============================================================================
// FUNCTIONAL API - Primary implementation
// These standalone functions are the intended future state of the dualStore API
// ============================================================================

// Global manager registry for functional API
const managerRegistry = new Map<string, DualStoreManager>();

/**
 * Create a new dual store manager instance (functional API)
 */
export async function create<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    name: string,
    textKey: TextKey,
    timeStampKey: TimeKey,
): Promise<DualStoreManager<TextKey, TimeKey>> {
    const manager = await DualStoreManager.create<TextKey, TimeKey>(name, textKey, timeStampKey);
    managerRegistry.set(name, manager);
    return manager;
}

/**
 * Insert an entry into the dual store (functional API)
 */
export async function insert<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    managerOrName: DualStoreManager<TextKey, TimeKey> | string,
    entry: DualStoreEntry<TextKey, TimeKey>,
): Promise<void> {
    const manager =
        typeof managerOrName === 'string'
            ? (managerRegistry.get(managerOrName) as DualStoreManager<TextKey, TimeKey>)
            : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    return manager.insert(entry);
}

/**
 * Add an entry to the dual store (functional API)
 */
export async function addEntry<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    managerOrName: DualStoreManager<TextKey, TimeKey> | string,
    entry: DualStoreEntry<TextKey, TimeKey>,
): Promise<void> {
    const manager =
        typeof managerOrName === 'string'
            ? (managerRegistry.get(managerOrName) as DualStoreManager<TextKey, TimeKey>)
            : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    return manager.addEntry(entry);
}

/**
 * Get most recent entries from the dual store (functional API)
 */
export async function getMostRecent<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    managerOrName: DualStoreManager<TextKey, TimeKey> | string,
    limit: number = 10,
    mongoFilter?: any,
    sorter?: any,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
    const manager =
        typeof managerOrName === 'string'
            ? (managerRegistry.get(managerOrName) as DualStoreManager<TextKey, TimeKey>)
            : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    return manager.getMostRecent(limit, mongoFilter, sorter);
}

/**
 * Get most relevant entries from the dual store (functional API)
 */
export async function getMostRelevant<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    managerOrName: DualStoreManager<TextKey, TimeKey> | string,
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
    const manager =
        typeof managerOrName === 'string'
            ? (managerRegistry.get(managerOrName) as DualStoreManager<TextKey, TimeKey>)
            : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    return manager.getMostRelevant(queryTexts, limit, where);
}

/**
 * Get an entry by ID from the dual store (functional API)
 */
export async function get<TextKey extends string = 'text', TimeKey extends string = 'createdAt'>(
    managerOrName: DualStoreManager<TextKey, TimeKey> | string,
    id: string,
): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
    const manager =
        typeof managerOrName === 'string'
            ? (managerRegistry.get(managerOrName) as DualStoreManager<TextKey, TimeKey>)
            : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    return manager.get(id);
}

/**
 * Cleanup all dual store resources (functional API)
 */
export async function cleanup(): Promise<void> {
    // Cleanup all registered managers
    for (const [name, manager] of managerRegistry) {
        try {
            await manager.cleanup();
        } catch (error) {
            console.warn(`Failed to cleanup manager ${name}:`, error);
        }
    }

    // Clear registry
    managerRegistry.clear();

    // Cleanup clients
    const { cleanupClients } = await import('./clients.js');
    await cleanupClients();
}
