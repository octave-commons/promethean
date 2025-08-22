import { v4 as uuidv4 } from 'uuid';
import { initMongo, Log } from '../logModel.js';
import { getChroma } from '../indexer.js';

let CHROMA_COLLECTION = null;
export async function getLogCollection() {
    if (CHROMA_COLLECTION) return CHROMA_COLLECTION;
    try {
        const col = await getChroma().getOrCreateCollection({
            name: 'bridge_logs',
            metadata: { type: 'logs' },
        });
        CHROMA_COLLECTION = col;
    } catch {
        CHROMA_COLLECTION = null;
    }
    return CHROMA_COLLECTION;
}

export async function mongoChromaLogger(app) {
    const collection = await getLogCollection().catch(() => null);

    app.addHook('onRequest', async (req) => {
        req.requestId = uuidv4();
        req.startTime = Date.now();
    });

    app.addHook('onResponse', async (req, reply) => {
        const latencyMs = Date.now() - (req.startTime || Date.now());
        const entry = {
            requestId: req.requestId,
            method: req.method,
            path: req.url,
            statusCode: reply.statusCode,
            request: { query: req.query, params: req.params, body: req.body },
            response: safeParse(reply.payload),
            createdAt: new Date(),
            latencyMs,
            service: 'smartgpt-bridge',
            operationId: reply.context?.schema?.operationId,
        };
        try {
            const mongo = await initMongo();
            if (mongo) await Log.create(entry);
        } catch {}
        try {
            const col = collection || (await getLogCollection());
            await col?.add({
                ids: [entry.requestId],
                documents: [JSON.stringify(entry)],
                metadatas: [
                    {
                        requestId: entry.requestId,
                        path: entry.path,
                        method: entry.method,
                        statusCode: entry.statusCode,
                        hasError: false,
                        createdAt: entry.createdAt.toISOString(),
                        latencyMs: entry.latencyMs,
                        service: entry.service,
                        operationId: entry.operationId,
                    },
                ],
            });
        } catch {}
    });

    app.addHook('onError', async (req, reply, error) => {
        const latencyMs = Date.now() - (req.startTime || Date.now());
        const entry = {
            requestId: req.requestId || uuidv4(),
            method: req.method,
            path: req.url,
            statusCode: reply.statusCode,
            request: { query: req.query, params: req.params, body: req.body },
            error: error.message,
            createdAt: new Date(),
            latencyMs,
            service: 'smartgpt-bridge',
            operationId: reply.context?.schema?.operationId,
        };
        try {
            const mongo = await initMongo();
            if (mongo) await Log.create(entry);
        } catch {}
        try {
            const col = collection || (await getLogCollection());
            await col?.add({
                ids: [entry.requestId],
                documents: [JSON.stringify(entry)],
                metadatas: [
                    {
                        requestId: entry.requestId,
                        path: entry.path,
                        method: entry.method,
                        statusCode: entry.statusCode,
                        hasError: true,
                        createdAt: entry.createdAt.toISOString(),
                        latencyMs: entry.latencyMs,
                        service: entry.service,
                        operationId: entry.operationId,
                    },
                ],
            });
        } catch {}
    });
}

function safeParse(payload) {
    if (!payload) return undefined;
    try {
        return typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch {
        return { raw: String(payload) };
    }
}
