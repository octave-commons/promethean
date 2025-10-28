import type { DeleteResult } from 'mongodb';
/**
 * Cleanup old Mongo entries by age.
 */
export declare function cleanupMongo(collectionName: string, maxAgeDays?: number): Promise<DeleteResult>;
/**
 * Cleanup Chroma collections by max size.
 * (Deletes oldest entries when size exceeds maxSize)
 */
export declare function cleanupChroma(collectionName: string, maxSize?: number): Promise<void>;
//# sourceMappingURL=maintenance.d.ts.map