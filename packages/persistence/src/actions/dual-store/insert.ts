import type { OptionalUnlessRequiredId } from 'mongodb';

import type { DualStoreEntry, DualStoreMetadata, DualStoreTimestamp } from '../../types.js';
import { pickTimestamp } from '../../serializers/pickTimestamp.js';
import { toEpochMilliseconds } from '../../serializers/toEpochMilliseconds.js';
import { toChromaMetadata } from '../../serializers/toChromaMetadata.js';
import { withTimestampMetadata } from '../../serializers/withTimestampMetadata.js';
import type { DualStoreDependencies, InsertInputs } from './types.js';

export const insert = async <TextKey extends string, TimeKey extends string>(
    inputs: InsertInputs<TextKey, TimeKey>,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<void> => {
    const { entry } = inputs;
    const { state, chroma, mongo, env, time, uuid, logger } = dependencies;

    const entryId = entry.id ?? uuid();
    const textValue = (entry as Record<TextKey, string>)[state.textKey];
    const primaryTimestamp = (entry as Record<TimeKey, DualStoreTimestamp | undefined>)[state.timeStampKey];
    const metadataTimestamp = entry.metadata?.[state.timeStampKey];
    const fallbackTimestamp = entry.metadata?.timeStamp;

    const resolvedTimestamp = pickTimestamp(primaryTimestamp, metadataTimestamp, fallbackTimestamp) ?? time();
    const epochTimestamp = toEpochMilliseconds(resolvedTimestamp);

    const metadataWithTimestamp = withTimestampMetadata(
        entry.metadata as DualStoreMetadata | undefined,
        state.timeStampKey,
        epochTimestamp,
    );

    const enhancedEntry: DualStoreEntry<TextKey, TimeKey> = {
        ...entry,
        id: entryId,
        [state.textKey]: textValue,
        [state.timeStampKey]: epochTimestamp as unknown as DualStoreEntry<TextKey, TimeKey>[TimeKey],
        metadata: metadataWithTimestamp,
    } as DualStoreEntry<TextKey, TimeKey>;

    const dualWriteEnabled = env.dualWriteEnabled;
    const isImage = enhancedEntry.metadata?.type === 'image';

    let vectorWriteSuccess = true;
    let vectorWriteError: Error | null = null;

    if (dualWriteEnabled && (!isImage || state.supportsImages)) {
        try {
            const chromaMetadata = toChromaMetadata(enhancedEntry.metadata ?? {});
            chromaMetadata[state.timeStampKey] = epochTimestamp;
            await chroma.queue.add(entryId, textValue, chromaMetadata);
        } catch (error) {
            vectorWriteSuccess = false;
            vectorWriteError = error instanceof Error ? error : new Error(String(error));

            logger.error('Vector store write failed for entry', {
                id: entryId,
                collection: state.name,
                error: vectorWriteError.message,
                stack: vectorWriteError.stack,
                metadata: enhancedEntry.metadata,
            });

            if (env.consistencyLevel === 'strict') {
                throw new Error(`Critical: Vector store write failed for entry ${entryId}: ${vectorWriteError.message}`);
            }
        }
    }

    const collection = await mongo.getCollection();

    const enhancedMetadata: DualStoreMetadata = {
        ...enhancedEntry.metadata,
        vectorWriteSuccess,
        vectorWriteError: vectorWriteError?.message,
        vectorWriteTimestamp: vectorWriteSuccess ? epochTimestamp : null,
    };

    await collection.insertOne({
        ...(enhancedEntry as DualStoreEntry<TextKey, TimeKey>),
        metadata: enhancedMetadata,
    } as OptionalUnlessRequiredId<DualStoreEntry<TextKey, TimeKey>>);
};
