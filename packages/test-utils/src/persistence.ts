import type { MongoClient } from 'mongodb';
import type { ChromaClient } from 'chromadb';

import {
    __setMongoClientForTests,
    __setChromaClientForTests,
    __resetPersistenceClientsForTests,
} from '@promethean-os/persistence/clients.js';

type DocumentRecord = Record<string, unknown>;
type FilterDoc = Record<string, unknown>;
type UpdateDoc = {
    readonly $set?: Record<string, unknown>;
    readonly $unset?: Record<string, unknown>;
};
type UpdateOptions = { readonly upsert?: boolean };
type Cursor<T> = { toArray: () => Promise<T[]> };

export class InMemoryCollection<T extends DocumentRecord = DocumentRecord> {
    readonly name: string;
    private data: T[] = [];
    constructor(name: string) {
        this.name = name;
    }
    async deleteMany(filter: FilterDoc): Promise<void> {
        this.data = this.data.filter((doc) => !matchesFilter(doc, filter));
    }
    async insertOne(doc: T): Promise<{ insertedId: unknown }> {
        this.data.push(structuredClone(doc));
        const insertedId = (doc as { id?: unknown }).id ?? null;
        return { insertedId };
    }
    async findOne(filter: FilterDoc = {}): Promise<T | null> {
        const doc = this.data.find((item) => matchesFilter(item, filter));
        return doc ? structuredClone(doc) : null;
    }
    find(filter: FilterDoc = {}): Cursor<T> {
        const arr = this.data.filter((doc) => matchesFilter(doc, filter));
        return {
            toArray: async () => arr.map((d) => structuredClone(d)),
        };
    }
    async countDocuments(filter: FilterDoc = {}): Promise<number> {
        return this.data.filter((doc) => matchesFilter(doc, filter)).length;
    }
    async updateOne(filter: FilterDoc, update: UpdateDoc, opts: UpdateOptions = {}): Promise<void> {
        const target = (() => {
            const existing = this.data.find((doc) => matchesFilter(doc, filter));
            if (existing) return existing;
            if (!opts.upsert) return null;
            const placeholder = {} as T;
            this.data.push(placeholder);
            return placeholder;
        })();
        if (target) applyUpdate(target, update);
    }
    async updateMany(filter: FilterDoc, update: UpdateDoc): Promise<void> {
        for (const doc of this.data) {
            if (matchesFilter(doc, filter)) applyUpdate(doc, update);
        }
    }
}

function getByPath(obj: DocumentRecord, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc === undefined || acc === null || typeof acc !== 'object') return undefined;
        return (acc as Record<string, unknown>)[key];
    }, obj);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

type OperatorEvaluator = (actual: unknown, operators: Record<string, unknown>) => boolean | undefined;

const operatorEvaluators: readonly OperatorEvaluator[] = [
    (actual, operators) => {
        const nin = operators.$nin;
        if (Array.isArray(nin)) return !nin.includes(actual);
        return undefined;
    },
    (actual, operators) => {
        const not = operators.$not;
        if (not instanceof RegExp) return !not.test(String(actual));
        return undefined;
    },
    (actual, operators) => {
        const exists = operators.$exists;
        if (typeof exists === 'boolean') return exists ? actual !== undefined : actual === undefined;
        return undefined;
    },
    (actual, operators) => {
        const gte = operators.$gte;
        if (typeof gte === 'number' && typeof actual === 'number') return actual >= gte;
        return undefined;
    },
    (actual, operators) => {
        const lt = operators.$lt;
        if (typeof lt === 'number' && typeof actual === 'number') return actual < lt;
        return undefined;
    },
];

function evaluateOperators(actual: unknown, operators: Record<string, unknown>): boolean {
    for (const evaluator of operatorEvaluators) {
        const result = evaluator(actual, operators);
        if (result !== undefined) return result;
    }
    return Object.is(actual, operators);
}


function matchesFilter(doc: DocumentRecord, filter: FilterDoc): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    return Object.entries(filter).every(([k, v]) => {
        const val = getByPath(doc, k);
        return isRecord(v) ? evaluateOperators(val, v) : Object.is(val, v);
    });
}

function applyUpdate(doc: DocumentRecord, update: UpdateDoc): void {
    if (update.$set && typeof update.$set === 'object') {
        for (const [k, v] of Object.entries(update.$set)) {
            setByPath(doc, k, v);
        }
    }
    if (update.$unset && typeof update.$unset === 'object') {
        for (const k of Object.keys(update.$unset)) {
            setByPath(doc, k, undefined);
        }
    }
}

function setByPath(obj: DocumentRecord, path: string, value: unknown): void {
    const [head, ...rest] = path.split('.');
    if (!head) return;
    if (rest.length === 0) {
        if (value === undefined) delete obj[head];
        else obj[head] = value;
        return;
    }

    const existing = obj[head];
    const next =
        typeof existing === 'object' && existing !== null && !Array.isArray(existing)
            ? (existing as DocumentRecord)
            : {};
    if (next !== existing) obj[head] = next;
    setByPath(next, rest.join('.'), value);
}

export class FakeDb {
    private readonly collections = new Map<string, InMemoryCollection<DocumentRecord>>();
    collection(name: string): InMemoryCollection<DocumentRecord> {
        if (!this.collections.has(name)) this.collections.set(name, new InMemoryCollection(name));
        return this.collections.get(name)!;
    }
}

export class FakeMongoClient {
    private readonly dbs = new Map<string, FakeDb>();
    async connect(): Promise<void> {}
    db(name: string): FakeDb {
        if (!this.dbs.has(name)) this.dbs.set(name, new FakeDb());
        return this.dbs.get(name)!;
    }
    async close(): Promise<void> {}
}

type EmptyChromaQuery = {
    ids: string[][];
    metadatas: Array<Array<Record<string, unknown>>>;
    documents: string[][];
};

export class FakeChromaCollection {
    async add(_: unknown): Promise<void> {}
    async count(): Promise<number> {
        return 0;
    }
    async query(_: unknown): Promise<EmptyChromaQuery> {
        return { ids: [], metadatas: [], documents: [] };
    }
}

export class FakeChromaClient {
    async getOrCreateCollection(_: unknown): Promise<FakeChromaCollection> {
        return new FakeChromaCollection();
    }
}

export function installInMemoryPersistence(): {
    mongo: FakeMongoClient;
    chroma: FakeChromaClient;
    dispose: () => void;
} {
    const mongo = new FakeMongoClient();
    const chroma = new FakeChromaClient();
    __setMongoClientForTests(mongo as unknown as MongoClient);
    __setChromaClientForTests(chroma as unknown as ChromaClient);
    return {
        mongo,
        chroma,
        dispose(): void {
            __resetPersistenceClientsForTests();
        },
    };
}
