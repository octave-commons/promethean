/**
 * Get an entry by ID from the dual store (functional API)
 */
export async function get(managerOrName: any, id: string): Promise<DualStoreEntry<'text', 'timestamp'> | null> {
    const manager = typeof managerOrName === 'string' ? managerRegistry.get(managerOrName) : managerOrName;

    if (!manager) {
        throw new Error(`Manager not found: ${typeof managerOrName === 'string' ? managerOrName : 'unknown'}`);
    }

    const textKey = manager.textKey as string;
    const timeStampKey = manager.timeStampKey as string;
    const collectionName = (manager.mongoCollection as { collectionName: string }).collectionName;

    const filter = { id } as any;

    // Ensure MongoDB connection is valid before querying
    const mongoClient = await getMongoClient();
    const validatedClient = await validateMongoConnection(mongoClient);
    const db = validatedClient.db('database');
    const collection = db.collection(collectionName);

    const document = await collection.findOne(filter);

    if (!document) {
        return null;
    }

    return {
        id: document.id,
        text: (document as Record<string, any>)[textKey],
        timestamp: new Date((document as Record<string, any>)[timeStampKey]).getTime(),
        metadata: document.metadata,
    } as DualStoreEntry<'text', 'timestamp'>;
}
