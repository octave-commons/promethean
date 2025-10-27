import type { Filter, UpdateFilter } from 'mongodb';

import type { DualStoreEntry } from '../../types.js';
import { toChromaMetadata } from '../../serializers/toChromaMetadata.js';
import { pickTimestamp } from '../../serializers/pickTimestamp.js';
import { toEpochMilliseconds } from '../../serializers/toEpochMilliseconds.js';
import type { DualStoreDependencies, RetryVectorWriteInputs } from './types.js';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retryVectorWrite = async <TextKey extends string, TimeKey extends string>(
    inputs: RetryVectorWriteInputs,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<boolean> => {
    const { id, maxRetries = 3 } = inputs;
    const { mongo, chroma, state, time } = dependencies;

    const collection = await mongo.getCollection();
    const filter = { id } as Filter<DualStoreEntry<TextKey, TimeKey>>;
    const mongoDoc = await collection.findOne(filter);

    if (!mongoDoc) {
        throw new Error(`Document ${id} not found for vector retry`);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const textValue = (mongoDoc as Record<TextKey, string>)[state.textKey];
            const chromaMetadata = toChromaMetadata(mongoDoc.metadata ?? {});
            const timestampCandidate = pickTimestamp(
                (mongoDoc as Record<TimeKey, unknown>)[state.timeStampKey],
                mongoDoc.metadata?.[state.timeStampKey],
                mongoDoc.metadata?.timeStamp,
            );
            chromaMetadata[state.timeStampKey] = toEpochMilliseconds(timestampCandidate ?? undefined);

            await chroma.collection.add({
                ids: [id],
                documents: [textValue],
                metadatas: [chromaMetadata],
            });

            await collection.updateOne(
                filter,
                {
                    $set: {
                        'metadata.vectorWriteSuccess': true,
                        'metadata.vectorWriteError': undefined,
                        'metadata.vectorWriteTimestamp': time(),
                    },
                } as UpdateFilter<DualStoreEntry<TextKey, TimeKey>>,
            );
            return true;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            dependencies.logger.warn(
                `Vector write retry ${attempt} failed for entry ${id}: ${lastError.message}`,
            );

            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000;
                await wait(delay);
            }
        }
    }

    await collection.updateOne(
        filter,
        {
            $set: {
                'metadata.vectorWriteSuccess': false,
                'metadata.vectorWriteError': lastError?.message,
                'metadata.vectorWriteTimestamp': null,
            },
        } as UpdateFilter<DualStoreEntry<TextKey, TimeKey>>,
    );

    return false;
};
