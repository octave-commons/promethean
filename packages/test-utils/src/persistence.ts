import type { MongoClient } from 'mongodb';
import type { ChromaClient } from 'chromadb';

import {
    __setMongoClientForTests,
    __setChromaClientForTests,
    __resetPersistenceClientsForTests,
} from '@promethean/persistence/clients.js';

type AnyDoc = Record<string, any>;

export class InMemoryCollection<T extends AnyDoc = AnyDoc> {
    name: string;
    data: T[] = [];
    constructor(name: string) {
        this.name = name;
    }
    async deleteMany(filter: AnyDoc) {
        this.data = this.data.filter((doc) => !matchesFilter(doc, filter));
    }
    async insertOne(doc: T) {
        this.data.push(structuredClone(doc));
        return { insertedId: (doc as AnyDoc).id };
    }
    async findOne(filter: AnyDoc = {}) {
        const doc = this.data.find((item) => matchesFilter(item, filter));
        return doc ? (structuredClone(doc) as T) : null;
    }
    find(filter: AnyDoc = {}) {
        const arr = this.data.filter((doc) => matchesFilter(doc, filter));
        return { toArray: async () => arr.map((d) => structuredClone(d)) } as any;
    }
    async countDocuments(filter: AnyDoc = {}) {
        return this.data.filter((doc) => matchesFilter(doc, filter)).length;
    }
    async updateOne(filter: AnyDoc, update: AnyDoc, opts: AnyDoc = {}) {
        let found = this.data.find((doc) => matchesFilter(doc, filter));
        if (!found && opts.upsert) {
            found = {} as T;
            this.data.push(found);
        }
        if (found) applyUpdate(found as AnyDoc, update);
    }
    async updateMany(filter: AnyDoc, update: AnyDoc) {
        for (const doc of this.data) {
            if (matchesFilter(doc, filter)) applyUpdate(doc as AnyDoc, update);
        }
    }
}

function getByPath(obj: AnyDoc, path: string): any {
    return path.split('.').reduce((acc: any, key) => (acc ? acc[key] : undefined), obj);
}

function matchesFilter(doc: AnyDoc, filter: AnyDoc): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    return Object.entries(filter).every(([k, v]) => {
        const val = getByPath(doc, k);
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            const nin = (v as AnyDoc).$nin;
            if (Array.isArray(nin)) return !nin.includes(val);
            const not = (v as AnyDoc).$not;
            if (not instanceof RegExp) return !not.test(val);
            const exists = (v as AnyDoc).$exists;
            if (typeof exists === 'boolean') return exists ? val !== undefined : val === undefined;
            const gte = (v as AnyDoc).$gte;
            if (gte !== undefined) return val >= gte;
            const lt = (v as AnyDoc).$lt;
            if (lt !== undefined) return val < lt;
        }
        return val === v;
    });
}

function applyUpdate(doc: AnyDoc, update: AnyDoc) {
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

function setByPath(obj: AnyDoc, path: string, value: any) {
    const parts = path.split('.');
    const last = parts.pop()!;
    let cur: AnyDoc = obj;
    for (const p of parts) {
        if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
        cur = cur[p];
    }
    if (value === undefined) delete cur[last];
    else cur[last] = value;
}

export class FakeDb {
    collections = new Map<string, InMemoryCollection<any>>();
    collection(name: string) {
        if (!this.collections.has(name)) this.collections.set(name, new InMemoryCollection(name));
        return this.collections.get(name)!;
    }
}

export class FakeMongoClient {
    dbs = new Map<string, FakeDb>();
    async connect() {}
    db(name: string) {
        if (!this.dbs.has(name)) this.dbs.set(name, new FakeDb());
        return this.dbs.get(name)!;
    }
    async close() {}
}

export class FakeChromaCollection {
    async add(_: any) {}
    async count() {
        return 0;
    }
    async query(_: any) {
        return { ids: [], metadatas: [], documents: [] } as any;
    }
}

export class FakeChromaClient {
    async getOrCreateCollection(_: any) {
        return new FakeChromaCollection();
    }
}

export function installInMemoryPersistence() {
    const mongo = new FakeMongoClient();
    const chroma = new FakeChromaClient();
    __setMongoClientForTests(mongo as unknown as MongoClient);
    __setChromaClientForTests(chroma as unknown as ChromaClient);
    return {
        mongo,
        chroma,
        dispose() {
            __resetPersistenceClientsForTests();
        },
    };
}
