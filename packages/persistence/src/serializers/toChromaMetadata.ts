import type { Metadata as ChromaMetadata } from 'chromadb';

import type { DualStoreMetadata } from '../types.js';

const normaliseValue = (value: unknown): string | number | boolean | null => {
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

export const toChromaMetadata = (metadata: DualStoreMetadata): ChromaMetadata => {
    const result: ChromaMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
        result[key] = normaliseValue(value);
    }
    return result;
};
