import type { DualStoreMetadata } from '../types.js';

export const withTimestampMetadata = (
    metadata: DualStoreMetadata | undefined,
    key: string,
    timestamp: number,
): DualStoreMetadata => ({
    ...metadata,
    [key]: timestamp,
    timeStamp: timestamp,
});
