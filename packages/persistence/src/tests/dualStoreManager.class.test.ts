import test from 'ava';

import { DualStoreManager } from '../dualStore.js';
import {
    __resetPersistenceClientsForTests,
    __setMongoClientForTests,
} from '../clients.js';
import { shutdownAllQueues } from '../chroma-write-queue.js';

type StoredDoc = Record<string, any>;

type QueryResult<T> = {
    sort: (sorter: Record<string, 1 | -1>) => QueryResult<T>;
    limit: (limit: number) => QueryResult<T>;
    toArray: () => Promise<T[]>;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const createCursor = <T extends StoredDoc>(docs: readonly T[]): QueryResult<T> => {
    let working = [...docs];
    let limitValue = working.length;

    const applySort = (sorter: Record<string, 1 | -1>) => {
        const [field, direction] = Object.entries(sorter)[0] ?? [];
        if (!field) return;
        const dir = direction === -1 ? -1 : 1;
        working = [...working].sort((a, b) => {
            const left = a[field];
            const right = b[field];
            if (left === right) return 0;
            if (left === undefined) return 1;
            if (right === undefined) return -1;
            return left > right ? dir : -dir;
        });
    };

    return {
        sort(sorter) {
            applySort(sorter);
            return this;
        },
        limit(limit) {
            limitValue = limit;
            return this;
        },
        async toArray() {
            return working.slice(0, limitValue).map((doc) => clone(doc));
        },
    } satisfies QueryResult<T>;
};

const matchesFilter = (doc: StoredDoc, filter: Record<string, any>): boolean => {
    return Object.entries(filter).every(([key, value]) => {
        if (value && typeof value === 'object') {
            if ('$eq' in value) return doc[key] === value.$eq;
            if ('$in' in value && Array.isArray(value.$in)) return value.$in.includes(doc[key]);
            if ('$ne' in value) return doc[key] !== value.$ne;
            if ('$nin' in value && Array.isArray(value.$nin)) return !value.$nin.includes(doc[key]);
            if ('$exists' in value) {
                const exists = doc[key] !== undefined;
                return value.$exists ? exists : !exists;
            }
            if ('$not' in value && value.$not instanceof RegExp) {
                return !value.$not.test(String(doc[key] ?? ''));
            }
        }
        if (value instanceof RegExp) {
            return value.test(String(doc[key] ?? ''));
        }
        return doc[key] === value;
    });
};

const createInMemoryCollection = () => {
    const docs: StoredDoc[] = [];
    return {
        docs,
        async insertOne(doc: StoredDoc) {
            docs.push(clone(doc));
            return { acknowledged: true } as const;
        },
        find(filter: Record<string, any> = {}) {
            const filtered = filter && Object.keys(filter).length > 0 ? docs.filter((doc) => matchesFilter(doc, filter)) : docs;
            return createCursor(filtered);
        },
        async findOne(filter: Record<string, any>) {
            return clone(docs.find((doc) => matchesFilter(doc, filter)) ?? null);
        },
        async updateOne(filter: Record<string, any>, update: { $set?: Record<string, any> }) {
            const target = docs.find((doc) => matchesFilter(doc, filter));
            if (!target) return { matchedCount: 0, modifiedCount: 0 } as const;
            if (update.$set) {
                Object.assign(target, update.$set);
            }
            return { matchedCount: 1, modifiedCount: 1 } as const;
        },
        async deleteOne(filter: Record<string, any>) {
            const index = docs.findIndex((doc) => matchesFilter(doc, filter));
            if (index === -1) return { deletedCount: 0 } as const;
            docs.splice(index, 1);
            return { deletedCount: 1 } as const;
        },
        async deleteMany(filter: Record<string, any>) {
            let count = 0;
            for (let i = docs.length - 1; i >= 0; i--) {
                const current = docs[i];
                if (current && matchesFilter(current, filter)) {
                    docs.splice(i, 1);
                    count++;
                }
            }
            return { deletedCount: count } as const;
        },
    };
};

const createMongoHarness = () => {
    const collections = new Map<string, ReturnType<typeof createInMemoryCollection>>();

    const getCollection = (name: string) => {
        if (!collections.has(name)) {
            collections.set(name, createInMemoryCollection());
        }
        return collections.get(name)!;
    };

    const client = {
        db: (name: string) => ({
            async command() {
                return { ok: 1 };
            },
            collection: (collectionName: string) => getCollection(`${name}.${collectionName}`),
        }),
        async close() {
            collections.clear();
        },
    };

    return {
        client,
        getDocs(collectionName: string) {
            return clone(collections.get(`database.${collectionName}`)?.docs ?? []);
        },
    };
};

const createChromaHarness = () => {
    const store = new Map<string, { document: string; metadata: Record<string, any> }>();

    return {
        collection: {
            async add(payload: { ids: string[]; documents: string[]; metadatas: Record<string, any>[] }) {
                payload.ids.forEach((id, index) => {
                    const documentValue = payload.documents[index] ?? '';
                    const metadataValue = clone(payload.metadatas[index] ?? {});
                    store.set(id, {
                        document: documentValue,
                        metadata: metadataValue,
                    });
                });
            },
            async query({ queryTexts, nResults, where }: { queryTexts: string[]; nResults: number; where?: Record<string, any> }) {
                if (queryTexts.length === 0) {
                    return { ids: [[]], documents: [[]], metadatas: [[]] };
                }
                const allItems = [...store.entries()];
                const filtered = allItems
                    .filter(([, value]) => {
                        if (!where) return true;
                        return Object.entries(where).every(([key, expected]) => value.metadata?.[key] === expected);
                    })
                    .slice(0, nResults);

                const ids = filtered.map(([id]) => id);
                const documents = filtered.map(([, value]) => value.document);
                const metadatas = filtered.map(([, value]) => clone(value.metadata));
                return {
                    ids: [[ids]],
                    documents: [[documents]],
                    metadatas: [[metadatas]],
                };
            },
            async get({ ids }: { ids: string[] }) {
                const results = ids.filter((id) => store.has(id));
                return {
                    ids: [results],
                    metadatas: [
                        results.map((id) => {
                            const entry = store.get(id);
                            return clone(entry?.metadata ?? {});
                        }),
                    ],
                    documents: [
                        results.map((id) => {
                            const entry = store.get(id);
                            return entry?.document ?? '';
                        }),
                    ],
                };
            },
        },
        store,
    };
};

const createQueueStub = () => {
    const calls: Array<{ id: string; document: string; metadata: Record<string, any> }> = [];
    let shouldFail = false;
    let shutdowns = 0;

    return {
        add: async (id: string, document: string, metadata: Record<string, any>) => {
            calls.push({ id, document, metadata: clone(metadata) });
            if (shouldFail) {
                throw new Error('vector-write-failure');
            }
        },
        getQueueStats: () => ({
            queueLength: calls.length,
            processing: false,
            config: {
                batchSize: 10,
                flushIntervalMs: 1000,
                maxRetries: 3,
                retryDelayMs: 2000,
                enabled: true,
            },
        }),
        shutdown: async () => {
            shutdowns += 1;
        },
        getCalls: () => clone(calls),
        getShutdownCount: () => shutdowns,
        failWrites: () => {
            shouldFail = true;
        },
    };
};

const setupManager = async () => {
    const mongoHarness = createMongoHarness();
    const chromaHarness = createChromaHarness();
    const queueStub = createQueueStub();

    __setMongoClientForTests(mongoHarness.client as any);

    const manager = new DualStoreManager(
        'test-collection',
        chromaHarness.collection as any,
        { collectionName: 'dual_store_entries' } as any,
        'text',
        'timestamp',
    );

    await shutdownAllQueues();

    (manager as any).chromaWriteQueue = queueStub;

    return { manager, mongoHarness, chromaHarness, queueStub };
};

test.beforeEach(() => {
    __resetPersistenceClientsForTests();
});

test.afterEach.always(async () => {
    await shutdownAllQueues();
    __resetPersistenceClientsForTests();
});

test('insert writes metadata and queues chroma vector', async (t) => {
    const { manager, mongoHarness, queueStub } = await setupManager();

    const entry = {
        id: 'doc-1',
        text: 'hello world',
        timestamp: Date.now(),
        metadata: { type: 'message', nested: { level: 1 } },
    } as const;

    await manager.insert(entry);

    const storedDocs = mongoHarness.getDocs('dual_store_entries');
    t.is(storedDocs.length, 1);
    t.like(storedDocs[0], {
        id: 'doc-1',
        text: 'hello world',
    });
    t.true(storedDocs[0].metadata.vectorWriteSuccess);
    t.is(storedDocs[0].metadata.vectorWriteError, undefined);
    t.truthy(storedDocs[0].metadata.vectorWriteTimestamp);

    const queueCalls = queueStub.getCalls();
    t.is(queueCalls.length, 1);
    const firstCall = queueCalls[0];
    t.truthy(firstCall);
    t.deepEqual(firstCall, {
        id: 'doc-1',
        document: 'hello world',
        metadata: {
            type: 'message',
            nested: JSON.stringify({ level: 1 }),
            timestamp: storedDocs[0].timestamp,
        },
    });

    await manager.cleanup();
});

test('insert records vector failure without throwing in eventual mode', async (t) => {
    const { manager, mongoHarness, queueStub } = await setupManager();
    queueStub.failWrites();

    const entry = {
        id: 'doc-2',
        text: 'resilient',
        timestamp: Date.now(),
        metadata: { type: 'message' },
    } as const;

    await t.notThrowsAsync(async () => manager.insert(entry));

    const storedDocs = mongoHarness.getDocs('dual_store_entries');
    t.is(storedDocs.length, 1);
    t.false(storedDocs[0].metadata.vectorWriteSuccess);
    t.regex(storedDocs[0].metadata.vectorWriteError ?? '', /vector-write-failure/);
    t.is(storedDocs[0].metadata.vectorWriteTimestamp, null);

    await manager.cleanup();
});

test('insert honors strict consistency configuration', async (t) => {
    const { manager, queueStub } = await setupManager();
    queueStub.failWrites();

    process.env.DUAL_WRITE_CONSISTENCY = 'strict';

    const entry = {
        id: 'doc-3',
        text: 'consistency',
        timestamp: Date.now(),
        metadata: {},
    } as const;

    await t.throwsAsync(async () => manager.insert(entry), { message: /vector store write failed/i });

    delete process.env.DUAL_WRITE_CONSISTENCY;
    await manager.cleanup();
});

test('getMostRecent returns latest documents ordered by timestamp', async (t) => {
    const { manager, mongoHarness } = await setupManager();

    const now = Date.now();
    await manager.insert({ id: 'a', text: 'first', timestamp: now - 1000, metadata: {} });
    await manager.insert({ id: 'b', text: 'second', timestamp: now - 500, metadata: {} });
    await manager.insert({ id: 'c', text: 'third', timestamp: now, metadata: {} });

    const results = await manager.getMostRecent(2, {}, { timestamp: -1 });
    t.deepEqual(results.map((doc) => doc.id), ['c', 'b']);

    const storedDocs = mongoHarness.getDocs('dual_store_entries');
    t.is(storedDocs.length, 3);

    await manager.cleanup();
});

test('get retrieves document with transformed timestamp', async (t) => {
    const { manager } = await setupManager();

    const timestamp = Date.now();
    await manager.insert({ id: 'get-1', text: 'fetch me', timestamp, metadata: { tag: 'demo' } });

    const fetched = await manager.get('get-1');
    t.truthy(fetched);
    t.is(fetched?.id, 'get-1');
    t.is(typeof fetched?.timestamp, 'number');
    t.deepEqual(fetched?.metadata, {
        tag: 'demo',
        vectorWriteSuccess: true,
        vectorWriteError: undefined,
        vectorWriteTimestamp: fetched?.metadata?.vectorWriteTimestamp,
    });

    await manager.cleanup();
});

test('checkConsistency reports vector availability', async (t) => {
    const { manager, chromaHarness } = await setupManager();
    await manager.insert({ id: 'consistency', text: 'vector doc', timestamp: Date.now(), metadata: {} });

    const report = await manager.checkConsistency('consistency');
    t.true(report.hasDocument);
    t.false(report.hasVector);

    await chromaHarness.collection.add({
        ids: ['consistency'],
        documents: ['vector doc'],
        metadatas: [{ type: 'message' }],
    });

    const updated = await manager.checkConsistency('consistency');
    t.true(updated.hasVector);

    await manager.cleanup();
});

test('retryVectorWrite updates document metadata on success', async (t) => {
    const { manager, chromaHarness } = await setupManager();

    await manager.insert({
        id: 'retry-success',
        text: 'retry me',
        timestamp: Date.now(),
        metadata: { reason: 'initial failure' },
    });

    const added = await manager.retryVectorWrite('retry-success', 1);
    t.true(added);

    const chromaEntry = chromaHarness.store.get('retry-success');
    t.truthy(chromaEntry);
    t.deepEqual(chromaEntry?.document, 'retry me');

    await manager.cleanup();
});

test('retryVectorWrite records failure after retries', async (t) => {
    const { manager } = await setupManager();

    await manager.insert({
        id: 'retry-fail',
        text: 'fail me',
        timestamp: Date.now(),
        metadata: {},
    });

    const originalAdd = (manager as any).chromaCollection.add;
    (manager as any).chromaCollection.add = async () => {
        throw new Error('still failing');
    };

    const result = await manager.retryVectorWrite('retry-fail', 1);
    t.false(result);

    const doc = await manager.get('retry-fail');
    t.false(doc?.metadata?.vectorWriteSuccess);
    t.regex(doc?.metadata?.vectorWriteError ?? '', /still failing/);

    (manager as any).chromaCollection.add = originalAdd;
    await manager.cleanup();
});

test('getConsistencyReport summarises documents', async (t) => {
    const { manager } = await setupManager();

    await manager.insert({ id: 'ok', text: 'ok', timestamp: Date.now(), metadata: { vectorWriteSuccess: true } });
    await manager.insert({ id: 'fail', text: 'fail', timestamp: Date.now(), metadata: {} });

    const doc = await manager.get('fail');
    if (doc) {
        const mongoClient = await (await import('../clients.js')).getMongoClient();
        const db = mongoClient.db('database');
        const collection = db.collection('dual_store_entries');
        await collection.updateOne(
            { id: 'fail' },
            {
                $set: {
                    id: 'fail',
                    text: doc.text,
                    timestamp: doc.timestamp,
                    metadata: {
                        ...doc.metadata,
                        vectorWriteSuccess: false,
                        vectorWriteError: 'boom',
                    },
                },
            },
        );
    }

    const report = await manager.getConsistencyReport(5);
    t.is(report.totalDocuments, 2);
    t.is(report.consistentDocuments, 1);
    t.is(report.inconsistentDocuments, 1);
    t.is(report.vectorWriteFailures.length, 1);

    await manager.cleanup();
});

test('getChromaQueueStats returns queue snapshot', async (t) => {
    const { manager, queueStub } = await setupManager();
    await manager.insert({ id: 'queue', text: 'snapshot', timestamp: Date.now(), metadata: {} });

    const stats = manager.getChromaQueueStats();
    t.like(stats, queueStub.getQueueStats());

    await manager.cleanup();
});

test('cleanup shuts down queue', async (t) => {
    const { manager, queueStub } = await setupManager();

    await manager.cleanup();
    t.is(queueStub.getShutdownCount(), 1);
});
