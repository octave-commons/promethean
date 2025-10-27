import type { WithId } from 'mongodb';
import type { DualStoreEntry } from '../../types.js';
import type { DualStoreState } from './types.js';

export const normaliseTimestamp = (value: unknown): number => {
    if (value instanceof Date) {
        return value.getTime();
    }

    if (typeof value === 'string') {
        const parsed = new Date(value).getTime();
        return Number.isNaN(parsed) ? Date.now() : parsed;
    }

    if (typeof value === 'number') {
        return value;
    }

    return Date.now();
};

export const normaliseMetadataValue = (value: unknown): string | number | boolean | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return JSON.stringify(value);
};

export const buildChromaMetadata = <TextKey extends string, TimeKey extends string>(
    entry: DualStoreEntry<TextKey, TimeKey>,
    state: DualStoreState<TextKey, TimeKey>,
): Record<string, string | number | boolean | null> => {
    const metadata: Record<string, unknown> = {
        [state.timeStampKey]: entry[state.timeStampKey],
        ...(entry.metadata ?? {}),
    };

    const chromaMetadata: Record<string, string | number | boolean | null> = {};

    for (const [key, value] of Object.entries(metadata)) {
        if (key === state.timeStampKey) {
            chromaMetadata[key] = normaliseTimestamp(value);
        } else {
            chromaMetadata[key] = normaliseMetadataValue(value);
        }
    }

    return chromaMetadata;
};

export const fromMongoDocument = <TextKey extends string, TimeKey extends string>(
    document: WithId<DualStoreEntry<TextKey, TimeKey>>,
    state: DualStoreState<TextKey, TimeKey>,
): DualStoreEntry<'text', 'timestamp'> => ({
    id: document.id,
    text: (document as Record<TextKey, string>)[state.textKey],
    timestamp: normaliseTimestamp((document as Record<TimeKey, unknown>)[state.timeStampKey]),
    metadata: document.metadata,
});

