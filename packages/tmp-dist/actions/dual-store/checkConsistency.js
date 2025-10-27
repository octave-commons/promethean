export const checkConsistency = async (inputs, dependencies) => {
    const { id } = inputs;
    const { mongo, chroma } = dependencies;
    const collection = await mongo.getCollection();
    const filter = { id };
    const mongoDoc = await collection.findOne(filter);
    const hasDocument = Boolean(mongoDoc);
    let hasVector = false;
    try {
        const vectorResult = await chroma.collection.get({ ids: [id] });
        hasVector = Array.isArray(vectorResult?.ids?.[0]) && vectorResult.ids[0]?.length > 0;
    }
    catch (error) {
        dependencies.logger.warn('Vector lookup failed during consistency check', error);
        hasVector = false;
    }
    return {
        hasDocument,
        hasVector,
        vectorWriteSuccess: mongoDoc?.metadata?.vectorWriteSuccess,
        vectorWriteError: mongoDoc?.metadata?.vectorWriteError,
    };
};
