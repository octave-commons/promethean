import type { Metadata as ChromaMetadata } from 'chromadb';

import type { DualStoreMetadata } from '../types.js';

export const toChromaMetadata = (metadata: DualStoreMetadata): ChromaMetadata => {
    const result: ChromaMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (value !== null && value !== undefined) {
            result[key] = value as string | number | boolean | null;
        }
    }
    return result;
};
