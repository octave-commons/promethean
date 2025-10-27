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

    const textKey = manager.textKey as string;
    const timeStampKey = manager.timeStampKey as string;
    const collectionName = (manager.mongoCollection as { collectionName: string }).collectionName;

    // Ensure MongoDB connection is valid before querying
    const mongoClient = await getMongoClient();
    const validatedClient = await validateMongoConnection(mongoClient);
    const db = validatedClient.db('database');
    const collection = db.collection(collectionName);

    const defaultFilter = { [textKey]: { $nin: [null, ''], $not: /^\s*$/ } };
    const defaultSorter = { [timeStampKey]: -1 };

    return (
        await collection
            .find(mongoFilter || defaultFilter)
            .sort(sorter || defaultSorter)
            .limit(limit)
            .toArray()
    ).map((entry: WithId<DualStoreEntry<any, any>>) => ({
        id: entry.id,
        text: (entry as Record<string, any>)[textKey],
        timestamp: new Date((entry as Record<string, any>)[timeStampKey]).getTime(),
        metadata: entry.metadata,
    })) as DualStoreEntry<'text', 'timestamp'>[];
}
