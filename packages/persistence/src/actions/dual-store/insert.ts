/**
 * Insert an entry into the dual store (functional API)
 */
export async function insert(managerOrName: any, entry: DualStoreEntry<any, any>): Promise<void> {
    const manager = typeof managerOrName === 'string' ? managerRegistry.get(managerOrName) : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    const textKey = manager.textKey as string;
    const timeStampKey = manager.timeStampKey as string;
    const collectionName = (manager.mongoCollection as { collectionName: string }).collectionName;

    const id = entry.id ?? randomUUID();
    const timestamp = (entry as Record<string, any>)[timeStampKey] || Date.now();

    // Create mutable copy to work with readonly types
    const mutableEntry = {
        ...entry,
        id,
        [timeStampKey]: timestamp,
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
            await manager.chromaWriteQueue.add(id, (mutableEntry as Record<string, any>)[textKey], chromaMetadata);
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
    const collection = db.collection(collectionName);

    // Add consistency metadata to track vector write status
    const enhancedMetadata = {
        ...mutableEntry.metadata,
        vectorWriteSuccess,
        vectorWriteError: vectorWriteError?.message,
        vectorWriteTimestamp: vectorWriteSuccess ? Date.now() : null,
    };

    await collection.insertOne({
        id: mutableEntry.id,
        [textKey]: (mutableEntry as Record<string, any>)[textKey],
        [timeStampKey]: (mutableEntry as Record<string, any>)[timeStampKey],
        metadata: enhancedMetadata,
    } as OptionalUnlessRequiredId<DualStoreEntry<any, any>>);
}
