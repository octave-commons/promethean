import type { DualStoreEntry } from '../../types.js';
import type { DualStoreDependencies, InsertInputs } from './types.js';

const normaliseMetadataValue = (value: unknown): string | number | boolean | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    return JSON.stringify(value);
};

const createChromaMetadata = <TextKey extends string, TimeKey extends string>(
    entry: DualStoreEntry<TextKey, TimeKey>,
    timestamp: number,
    timeStampKey: TimeKey,
): Record<string, string | number | boolean | null> => {
    const metadata = entry.metadata ?? {};
    const base: Record<string, string | number | boolean | null> = {
        [timeStampKey]: timestamp,
    } as Record<string, string | number | boolean | null>;

    for (const [key, value] of Object.entries(metadata)) {
        base[key] = normaliseMetadataValue(value);
    }

    return base;
};

export const insert = async <TextKey extends string, TimeKey extends string>(
    inputs: InsertInputs<TextKey, TimeKey>,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<void> => {
    const { entry } = inputs;
    const { state, chroma, mongo, env, time, uuid, logger } = dependencies;

    const entryId = entry.id ?? uuid();
    const timestamp = (entry as Record<string, unknown>)[state.timeStampKey] ?? time();

    const enhancedEntry: DualStoreEntry<TextKey, TimeKey> = {
        ...entry,
        id: entryId,
        [state.timeStampKey]: timestamp as DualStoreEntry<TextKey, TimeKey>[TimeKey],
        metadata: {
            ...entry.metadata,
            [state.timeStampKey]: timestamp,
        },
    };

    const dualWriteEnabled = env.dualWriteEnabled;
    const isImage = enhancedEntry.metadata?.type === 'image';

    let vectorWriteSuccess = true;
    let vectorWriteError: Error | null = null;

    if (dualWriteEnabled && (!isImage || state.supportsImages)) {
        try {
            const chromaMetadata = createChromaMetadata(enhancedEntry, Number(timestamp), state.timeStampKey);
            await chroma.queue.add(entryId, (enhancedEntry as Record<string, string>)[state.textKey], chromaMetadata);
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

    const enhancedMetadata = {
        ...enhancedEntry.metadata,
        vectorWriteSuccess,
        vectorWriteError: vectorWriteError?.message,
        vectorWriteTimestamp: vectorWriteSuccess ? time() : null,
    } satisfies DualStoreEntry<TextKey, TimeKey>['metadata'];

    await collection.insertOne({
        ...(enhancedEntry as DualStoreEntry<TextKey, TimeKey>),
        metadata: enhancedMetadata,
    });
};
