import type { Collection as ChromaCollection } from 'chromadb';
import type { Collection, OptionalUnlessRequiredId, WithId } from 'mongodb';
import type { DualStoreEntry, AliasDoc } from './types.js';
import { getChromaClient, getMongoClient, validateMongoConnection } from './clients.js';
import { getOrCreateQueue } from './chroma-write-queue.js';
import { RemoteEmbeddingFunction } from '@promethean-os/embedding';
import { randomUUID } from 'node:crypto';

// Global manager registry for functional API
const managerRegistry = new Map<string, any>();

/**
 * Create a new dual store manager instance (functional API)
 */
export async function create(name: string, textKey: string, timeStampKey: string): Promise<any> {
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

    const mongoCollection = db.collection(family);

    const supportsImages = !embedFnName.toLowerCase().includes('text');

    // Create a simple manager object with the methods we need
    const manager = {
        name: family,
        chromaCollection,
        mongoCollection,
        textKey,
        timeStampKey,
        supportsImages,
        chromaWriteQueue: getOrCreateQueue(name, chromaCollection),
    };

    managerRegistry.set(name, manager);
    return manager;
}

/**
 * Insert an entry into the dual store (functional API)
 */
export async function insert(managerOrName: any, entry: DualStoreEntry<any, any>): Promise<void> {
    const manager = typeof managerOrName === 'string' ? managerRegistry.get(managerOrName) : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    const id = entry.id ?? randomUUID();
    const timestamp = entry[manager.timeStampKey] || Date.now();

    // Create mutable copy to work with readonly types
    const mutableEntry = {
        ...entry,
        id,
        [manager.timeStampKey]: timestamp,
        metadata: {
            ...entry.metadata,
            [manager.timeStampKey]: timestamp,
        },
    };

    const dualWrite = (process.env.DUAL_WRITE_ENABLED ?? 'true').toLowerCase() !== 'false';
    const isImage = mutableEntry.metadata?.type === 'image';
    let vectorWriteSuccess = true;
    let vectorWriteError: Error | null = null;

    if (dualWrite && (!isImage || manager.supportsImages)) {
        try {
            // Flatten metadata for ChromaDB compatibility
            const chromaMetadata: Record<string, string | number | boolean | null> = {};
            if (mutableEntry.metadata) {
                for (const [key, value] of Object.entries(mutableEntry.metadata)) {
                    if (value === null || value === undefined) {
                        chromaMetadata[key] = null;
                    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        chromaMetadata[key] = value;
                    } else {
                        // Convert objects to JSON strings for ChromaDB compatibility
                        chromaMetadata[key] = JSON.stringify(value);
                    }
                }
            }

            // Use write queue for batching
            await manager.chromaWriteQueue.add(id, mutableEntry[manager.textKey], chromaMetadata);
        } catch (e) {
            vectorWriteSuccess = false;
            vectorWriteError = e instanceof Error ? e : new Error(String(e));

            console.error('Vector store write failed for entry', {
                id,
                collection: manager.name,
                error: vectorWriteError.message,
                stack: vectorWriteError.stack,
                metadata: mutableEntry.metadata,
            });

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
    const collection = db.collection(manager.mongoCollection.collectionName);

    // Add consistency metadata to track vector write status
    const enhancedMetadata = {
        ...mutableEntry.metadata,
        vectorWriteSuccess,
        vectorWriteError: vectorWriteError?.message,
        vectorWriteTimestamp: vectorWriteSuccess ? Date.now() : null,
    };

    await collection.insertOne({
        id: mutableEntry.id,
        [manager.textKey]: mutableEntry[manager.textKey],
        [manager.timeStampKey]: mutableEntry[manager.timeStampKey],
        metadata: enhancedMetadata,
    } as OptionalUnlessRequiredId<DualStoreEntry<any, any>>);
}

/**
 * Add an entry to the dual store (functional API)
 */
export async function addEntry(managerOrName: any, entry: DualStoreEntry<any, any>): Promise<void> {
    return insert(managerOrName, entry);
}

/**
 * Get most recent entries from the dual store (functional API)
 */
export async function getMostRecent(
    managerOrName: any,
    limit = 10,
    mongoFilter?: any,
    sorter?: any,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
    const manager = typeof managerOrName === 'string' ? managerRegistry.get(managerOrName) : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    // Ensure MongoDB connection is valid before querying
    const mongoClient = await getMongoClient();
    const validatedClient = await validateMongoConnection(mongoClient);
    const db = validatedClient.db('database');
    const collection = db.collection(manager.mongoCollection.collectionName);

    const defaultFilter = { [manager.textKey]: { $nin: [null, ''], $not: /^\s*$/ } };
    const defaultSorter = { [manager.timeStampKey]: -1 };

    return (
        await collection
            .find(mongoFilter || defaultFilter)
            .sort(sorter || defaultSorter)
            .limit(limit)
            .toArray()
    ).map((entry: WithId<DualStoreEntry<any, any>>) => ({
        id: entry.id,
        text: (entry as any)[manager.textKey],
        timestamp: new Date((entry as any)[manager.timeStampKey]).getTime(),
        metadata: entry.metadata,
    })) as DualStoreEntry<'text', 'timestamp'>[];
}

/**
 * Get most relevant entries from the dual store (functional API)
 */
export async function getMostRelevant(
    managerOrName: any,
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> {
    const manager = typeof managerOrName === 'string' ? managerRegistry.get(managerOrName) : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    if (!queryTexts || queryTexts.length === 0) return [];

    const query: Record<string, any> = {
        queryTexts,
        nResults: limit,
    };
    if (where && Object.keys(where).length > 0) query.where = where;
    const queryResult = await manager.chromaCollection.query(query);
    const uniqueThoughts = new Set();
    const ids = queryResult.ids.flat(2);
    const meta = queryResult.metadatas.flat(2);
    return queryResult.documents
        .flat(2)
        .map((doc, i) => ({
            id: ids[i],
            text: doc,
            metadata: meta[i],
            timestamp: meta[i]?.timeStamp || meta[i]?.[manager.timeStampKey] || Date.now(),
        }))
        .filter((doc) => {
            if (!doc.text) return false;
            if (uniqueThoughts.has(doc.text)) return false;
            uniqueThoughts.add(doc.text);
            return true;
        }) as DualStoreEntry<'text', 'timestamp'>[];
}

/**
 * Get an entry by ID from the dual store (functional API)
 */
export async function get(managerOrName: any, id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
    const manager = typeof managerOrName === 'string' ? managerRegistry.get(managerOrName) : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    const filter = { id } as any;

    // Ensure MongoDB connection is valid before querying
    const mongoClient = await getMongoClient();
    const validatedClient = await validateMongoConnection(mongoClient);
    const db = validatedClient.db('database');
    const collection = db.collection(manager.mongoCollection.collectionName);

    const document = await collection.findOne(filter);

    if (!document) {
        return null;
    }

    return {
        id: document.id,
        text: (document as any)[manager.textKey],
        timestamp: new Date((document as any)[manager.timeStampKey]).getTime(),
        metadata: document.metadata,
    } as DualStoreEntry<'text', 'timestamp'>;
}

/**
 * Cleanup all dual store resources (functional API)
 */
export async function cleanup(): Promise<void> {
    // Cleanup all registered managers
    for (const [name, manager] of managerRegistry) {
        try {
            await manager.chromaWriteQueue.shutdown();
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
