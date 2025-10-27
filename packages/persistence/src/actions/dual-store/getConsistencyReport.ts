export async function checkConsistency(id: string): Promise<{
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
