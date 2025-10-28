import type { DualStoreTimestamp } from '../types.js';

export const toEpochMilliseconds = (timestamp: DualStoreTimestamp | undefined): number => {
    if (timestamp instanceof Date) return timestamp.getTime();
    if (typeof timestamp === 'string') return new Date(timestamp).getTime();
    if (typeof timestamp === 'number') return timestamp;
    return Date.now();
};
