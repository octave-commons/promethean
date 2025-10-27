import { toChromaMetadata } from '../../serializers/toChromaMetadata.js';
import { pickTimestamp } from '../../serializers/pickTimestamp.js';
import { toEpochMilliseconds } from '../../serializers/toEpochMilliseconds.js';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const retryVectorWrite = async (inputs, dependencies) => {
    const { id, maxRetries = 3 } = inputs;
    const { mongo, chroma, state, time } = dependencies;
    const collection = await mongo.getCollection();
    const filter = { id };
    const mongoDoc = await collection.findOne(filter);
    if (!mongoDoc) {
        throw new Error(`Document ${id} not found for vector retry`);
    }
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const textValue = mongoDoc[state.textKey];
            const chromaMetadata = toChromaMetadata(mongoDoc.metadata ?? {});
            const timestampCandidate = pickTimestamp(mongoDoc[state.timeStampKey], mongoDoc.metadata?.[state.timeStampKey], mongoDoc.metadata?.timeStamp);
            chromaMetadata[state.timeStampKey] = toEpochMilliseconds(timestampCandidate ?? undefined);
            await chroma.collection.add({
                ids: [id],
                documents: [textValue],
                metadatas: [chromaMetadata],
            });
            await collection.updateOne(filter, {
                $set: {
                    'metadata.vectorWriteSuccess': true,
                    'metadata.vectorWriteError': undefined,
                    'metadata.vectorWriteTimestamp': time(),
                },
            });
            return true;
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            dependencies.logger.warn(`Vector write retry ${attempt} failed for entry ${id}: ${lastError.message}`);
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000;
                await wait(delay);
            }
        }
    }
    await collection.updateOne(filter, {
        $set: {
            'metadata.vectorWriteSuccess': false,
            'metadata.vectorWriteError': lastError?.message,
            'metadata.vectorWriteTimestamp': null,
        },
    });
    return false;
};
