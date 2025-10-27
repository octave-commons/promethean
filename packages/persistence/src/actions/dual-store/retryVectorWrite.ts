import type { Filter } from 'mongodb';

import type { DualStoreEntry } from '../../types.js';
import type { DualStoreDependencies, RetryVectorWriteInputs } from './types.js';

import { buildChromaMetadata } from './utils.js';

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
            const chromaMetadata = buildChromaMetadata(mongoDoc, state);

            await chroma.collection.add({
                ids: [id],
                documents: [(mongoDoc as Record<TextKey, string>)[state.textKey]],
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
                },
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
        },
    );

    return false;
};
