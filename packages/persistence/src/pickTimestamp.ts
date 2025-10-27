import type { DualStoreTimestamp } from './types.js';

export const pickTimestamp = (...candidates: readonly unknown[]): DualStoreTimestamp | undefined => {
    for (const candidate of candidates) {
        if (candidate instanceof Date || typeof candidate === 'number' || typeof candidate === 'string') {
            return candidate as DualStoreTimestamp;
        }
    }
    return undefined;
};
