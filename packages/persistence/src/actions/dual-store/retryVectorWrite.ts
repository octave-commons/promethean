export async function retryVectorWrite(id: string, maxRetries = 3): Promise<boolean> {
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
                    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
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
