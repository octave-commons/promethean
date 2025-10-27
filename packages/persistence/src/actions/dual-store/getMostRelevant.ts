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

    const timeStampKey = manager.timeStampKey as string;

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
        .map((doc: string, i: number) => ({
            id: ids[i],
            text: doc,
            metadata: meta[i],
            timestamp: meta[i]?.timeStamp || meta[i]?.[timeStampKey] || Date.now(),
        }))
        .filter((doc: DualStoreEntry<'text', 'timestamp'>) => {
            if (!doc.text) return false;
            if (uniqueThoughts.has(doc.text)) return false;
            uniqueThoughts.add(doc.text);
            return true;
        }) as DualStoreEntry<'text', 'timestamp'>[];
}
