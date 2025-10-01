#!/usr/bin/env node
import type { ChangeStreamOptions, ResumeToken } from 'mongodb';
import { MongoClient } from 'mongodb';

import { makeDeterministicEmbedder, type Embedder } from './embedder.js';
import { makeChromaWrapper, type ChromaWrapper } from './chroma.js';
import { makeCheckpointStore, type CheckpointStore } from './checkpoints.js';

type EnvConfig = {
    readonly mongoUri: string;
    readonly chromaUrl: string;
    readonly chromaCollectionPrefix: string;
    readonly embeddingModel: string;
    readonly embeddingDim: number;
    readonly collections: ReadonlyArray<string>;
};

type SourceDocument = {
    readonly _id: unknown;
    readonly text?: string | null;
    readonly meta?: Readonly<Record<string, unknown>> | null;
};

type StreamContext = {
    readonly checkpointStore: CheckpointStore;
    readonly embedder: Embedder;
    readonly chroma: ChromaWrapper;
    readonly checkpointId: string;
};

type UpsertChangeEvent = {
    readonly kind: 'upsert';
    readonly operationType: 'insert' | 'replace' | 'update';
    readonly document: SourceDocument;
    readonly resumeToken?: ResumeToken;
};

type DeleteChangeEvent = {
    readonly kind: 'delete';
    readonly operationType: 'delete';
    readonly documentId: string;
    readonly resumeToken?: ResumeToken;
};

type OtherChangeEvent = {
    readonly kind: 'other';
    readonly operationType: string;
    readonly resumeToken?: ResumeToken;
};

type ParsedChangeEvent = UpsertChangeEvent | DeleteChangeEvent | OtherChangeEvent;

const DEFAULT_COLLECTIONS = ['messages'] as const;

function parseCollections(argv: ReadonlyArray<string>): ReadonlyArray<string> {
    const index = argv.indexOf('--collections');
    const raw = index >= 0 ? argv[index + 1] ?? '' : DEFAULT_COLLECTIONS.join(',');
    return raw
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
}

function parseEnv(env: NodeJS.ProcessEnv, argv: ReadonlyArray<string>): EnvConfig {
    const {
        MONGO_URI = 'mongodb://localhost:27017',
        CHROMA_URL = 'http://localhost:8000',
        CHROMA_COLLECTION_PREFIX = 'promethean_',
        EMBEDDING_MODEL = 'deterministic:v1',
        EMBEDDING_DIM = '1536',
    } = env;

    const embeddingDim = Number(EMBEDDING_DIM) || 1536;
    const collections = parseCollections(argv);

    return {
        mongoUri: MONGO_URI,
        chromaUrl: CHROMA_URL,
        chromaCollectionPrefix: CHROMA_COLLECTION_PREFIX,
        embeddingModel: EMBEDDING_MODEL,
        embeddingDim,
        collections: collections.length > 0 ? collections : [...DEFAULT_COLLECTIONS],
    };
}

function databaseNameFromUri(uri: string): string {
    const parsed = new URL(uri);
    const db = parsed.pathname.replace(/\//, '');
    return db.length > 0 ? db : 'promethean';
}

function toResumeOptions(token: ResumeToken | undefined): ChangeStreamOptions {
    return token ? { resumeAfter: token, fullDocument: 'updateLookup' } : { fullDocument: 'updateLookup' };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null;
}

function toMetadata(meta: SourceDocument['meta']): Readonly<Record<string, unknown>> {
    return isRecord(meta) ? meta : {};
}

function toText(doc: SourceDocument): string {
    const value = doc.text;
    return typeof value === 'string' ? value : '';
}

function hasProperty<T extends string>(
    value: Readonly<Record<string, unknown>>,
    property: T,
): value is Readonly<Record<string, unknown>> & Record<T, unknown> {
    return property in value;
}

function isResumeToken(value: unknown): value is ResumeToken {
    return value !== undefined;
}

function normalizeSourceDocument(value: unknown): SourceDocument | null {
    if (!isRecord(value)) return null;
    if (!hasProperty(value, '_id')) return null;
    const base = value;
    const text = typeof base.text === 'string' ? base.text : undefined;
    const metaCandidate = base.meta;
    const meta = isRecord(metaCandidate) ? metaCandidate : metaCandidate === null ? null : undefined;
    return {
        _id: base._id,
        ...(text !== undefined ? { text } : {}),
        ...(meta !== undefined ? { meta } : {}),
    };
}

function parseChangeEvent(value: unknown): ParsedChangeEvent | null {
    if (!isRecord(value) || typeof value.operationType !== 'string') {
        return null;
    }

    const resumeToken = hasProperty(value, '_id') && isResumeToken(value._id) ? value._id : undefined;
    const operationType = value.operationType;

    if (operationType === 'insert' || operationType === 'replace' || operationType === 'update') {
        const document = normalizeSourceDocument(value.fullDocument);
        if (!document) return null;
        return { kind: 'upsert', operationType, document, resumeToken };
    }

    if (operationType === 'delete') {
        const key = value.documentKey;
        if (!isRecord(key) || !hasProperty(key, '_id')) return null;
        return {
            kind: 'delete',
            operationType,
            documentId: String(key._id),
            resumeToken,
        };
    }

    return { kind: 'other', operationType, resumeToken };
}

async function upsertDocument(context: StreamContext, document: SourceDocument): Promise<void> {
    const embedding = await context.embedder.embedOne(toText(document));
    await context.chroma.upsert([
        {
            id: String(document._id),
            embedding,
            metadata: toMetadata(document.meta),
            document: toText(document),
        },
    ]);
}

async function deleteDocument(context: StreamContext, documentId: string): Promise<void> {
    await context.chroma.delete([documentId]);
}

async function handleChange(context: StreamContext, event: ParsedChangeEvent): Promise<void> {
    if (event.kind === 'upsert') {
        await upsertDocument(context, event.document);
    } else if (event.kind === 'delete') {
        await deleteDocument(context, event.documentId);
    }

    if (event.resumeToken) {
        await context.checkpointStore.setResumeToken(context.checkpointId, event.resumeToken);
    }
}

type StartStreamArgs = {
    readonly config: EnvConfig;
    readonly client: MongoClient;
    readonly dbName: string;
    readonly checkpointStore: CheckpointStore;
    readonly embedder: Embedder;
    readonly collectionName: string;
};

async function startStream({
    config,
    client,
    dbName,
    checkpointStore,
    embedder,
    collectionName,
}: StartStreamArgs): Promise<void> {
    const db = client.db(dbName);
    const collection = db.collection<SourceDocument>(collectionName);

    const chroma = makeChromaWrapper({
        url: config.chromaUrl,
        prefix: config.chromaCollectionPrefix,
        collection: `${config.chromaCollectionPrefix}${collectionName}`,
        embeddingDim: config.embeddingDim,
    });
    await chroma.ensureCollection();

    const checkpointId = `cdc:${collectionName}`;
    const resumeToken = await checkpointStore.getResumeToken(checkpointId);
    const stream = collection.watch([], toResumeOptions(resumeToken));

    const context: StreamContext = {
        checkpointStore,
        embedder,
        chroma,
        checkpointId,
    };

    console.log(`[cdc] tailing ${collectionName} ...`);
    stream.on('change', (rawEvent) => {
        const event = parseChangeEvent(rawEvent);
        if (!event) return;
        void handleChange(context, event).catch((error) => {
            console.error(`[cdc:${collectionName}] error`, error);
        });
    });
}

async function main(): Promise<void> {
    const config = parseEnv(process.env, process.argv);
    const client = new MongoClient(config.mongoUri);
    await client.connect();
    const dbName = databaseNameFromUri(config.mongoUri);
    const checkpointStore = await makeCheckpointStore(config.mongoUri, dbName);
    const embedder = makeDeterministicEmbedder({ modelId: config.embeddingModel, dim: config.embeddingDim });

    await Promise.all(
        config.collections.map((collectionName) =>
            startStream({
                config,
                client,
                dbName,
                checkpointStore,
                embedder,
                collectionName,
            }),
        ),
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
