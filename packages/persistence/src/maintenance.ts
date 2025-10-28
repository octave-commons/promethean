import type { DeleteResult } from 'mongodb';

import { getMongoClient, getChromaClient } from './clients.js';

/**
 * Cleanup old Mongo entries by age.
 */
export async function cleanupMongo(collectionName: string, maxAgeDays = 30): Promise<DeleteResult> {
    const db = (await getMongoClient()).db('database');
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    return db.collection(collectionName).deleteMany({ createdAt: { $lt: cutoff } });
}

/**
 * Cleanup Chroma collections by max size.
 * (Deletes oldest entries when size exceeds maxSize)
 */
export async function cleanupChroma(collectionName: string, maxSize = 10000): Promise<void> {
    const chroma = await getChromaClient();
    const col = await chroma.getOrCreateCollection({ name: collectionName });

    const count = await col.count();
    if (count > maxSize) {
        // TODO: implement removal policy (e.g. delete oldest first)
        console.warn(`[DualStore] Chroma collection "${collectionName}" exceeds ${maxSize} entries`);
    }
}
