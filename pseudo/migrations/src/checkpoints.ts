import { MongoClient, Collection, ResumeToken } from 'mongodb';

export type Phase = 'prepare' | 'backfill' | 'cdc' | 'dualwrite' | 'cutover' | 'decommission';

export type Checkpoint = {
    readonly id: string; // collection name or logical stream id
    readonly phase: Phase;
    readonly batch: number; // last completed batch number
    readonly lastId?: string; // last processed id (for paging)
    readonly updatedAt: string; // ISO timestamp
    readonly resumeToken?: ResumeToken; // MongoDB change stream resume token
};

export type CheckpointStore = {
    get(id: string): Promise<Checkpoint | null>;
    set(cp: Checkpoint): Promise<void>;
    advancePhase(id: string, phase: Phase): Promise<Checkpoint>;
    getResumeToken(id: string): Promise<ResumeToken | undefined>;
    setResumeToken(id: string, token: ResumeToken): Promise<void>;
};

export class MongoCheckpointStore implements CheckpointStore {
    private readonly coll: Collection<Checkpoint>;
    constructor(
        private readonly client: MongoClient,
        private readonly dbName: string,
        private readonly collection = 'migrations',
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
        const next: Checkpoint = {
            ...cp,
            updatedAt: new Date().toISOString(),
        };
        await this.coll.updateOne({ id: cp.id }, { $set: next }, { upsert: true });
    }

    async advancePhase(id: string, phase: Phase): Promise<Checkpoint> {
        const prev = await this.get(id);
        const next: Checkpoint = {
            id,
            phase,
            batch: prev?.batch ?? 0,
            updatedAt: new Date().toISOString(),
            ...(prev?.lastId !== undefined ? { lastId: prev.lastId } : {}),
            ...(prev?.resumeToken !== undefined ? { resumeToken: prev.resumeToken } : {}),
        };
        await this.set(next);
        return next;
    }

    async getResumeToken(id: string): Promise<ResumeToken | undefined> {
        return (await this.get(id))?.resumeToken;
    }

    async setResumeToken(id: string, token: ResumeToken): Promise<void> {
        const prev = (await this.get(id)) ?? {
            id,
            phase: 'prepare' as const,
            batch: 0,
            updatedAt: new Date().toISOString(),
        };
        const next: Checkpoint = {
            ...prev,
            resumeToken: token,
        };
        await this.set(next);
    }
}

export async function makeCheckpointStore(
    uri: string,
    dbName: string,
    collection?: string,
): Promise<MongoCheckpointStore> {
    const client = new MongoClient(uri);
    await client.connect();
    const store = new MongoCheckpointStore(client, dbName, collection);
    await store.init();
    return store;
}
