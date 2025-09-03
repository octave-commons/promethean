// SPDX-License-Identifier: GPL-3.0-only
import { MongoClient, Collection } from 'mongodb';

export type Phase = 'prepare' | 'backfill' | 'cdc' | 'dualwrite' | 'cutover' | 'decommission';

export type Checkpoint = {
    id: string; // collection name or logical stream id
    phase: Phase;
    batch: number; // last completed batch number
    lastId?: string; // last processed id (for paging)
    updatedAt: string; // ISO timestamp
    resumeToken?: unknown; // MongoDB change stream resume token
};

export interface CheckpointStore {
    get(id: string): Promise<Checkpoint | null>;
    set(cp: Checkpoint): Promise<void>;
    advancePhase(id: string, phase: Phase): Promise<Checkpoint>;
    getResumeToken(id: string): Promise<unknown | undefined>;
    setResumeToken(id: string, token: unknown): Promise<void>;
}

export class MongoCheckpointStore implements CheckpointStore {
    private coll: Collection<Checkpoint>;
    constructor(
        private client: MongoClient,
        private dbName: string,
        private collection = 'migrations',
    ) {
        this.coll = this.client.db(this.dbName).collection<Checkpoint>(this.collection);
    }

    async init(): Promise<void> {
        await this.coll.createIndex({ id: 1 }, { unique: true });
    }

    async get(id: string): Promise<Checkpoint | null> {
        return this.coll.findOne({ id });
    }

    async set(cp: Checkpoint): Promise<void> {
        cp.updatedAt = new Date().toISOString();
        await this.coll.updateOne({ id: cp.id }, { $set: cp }, { upsert: true });
    }

    async advancePhase(id: string, phase: Phase): Promise<Checkpoint> {
        const next: Checkpoint = {
            id,
            phase,
            batch: (await this.get(id))?.batch ?? 0,
            updatedAt: new Date().toISOString(),
            lastId: (await this.get(id))?.lastId,
            resumeToken: (await this.get(id))?.resumeToken,
        };
        await this.set(next);
        return next;
    }

    async getResumeToken(id: string): Promise<unknown | undefined> {
        return (await this.get(id))?.resumeToken;
    }

    async setResumeToken(id: string, token: unknown): Promise<void> {
        const cp = (await this.get(id)) ?? { id, phase: 'prepare', batch: 0, updatedAt: new Date().toISOString() };
        cp.resumeToken = token as any;
        await this.set(cp);
    }
}

export async function makeCheckpointStore(uri: string, dbName: string, collection?: string) {
    const client = new MongoClient(uri);
    await client.connect();
    const store = new MongoCheckpointStore(client, dbName, collection);
    await store.init();
    return store;
}
