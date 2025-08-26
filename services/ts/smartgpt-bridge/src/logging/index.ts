// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { contextStore } from '../sinks.js';

export async function mongoChromaLogger(app) {
    let logStore;
    try {
        logStore = contextStore.getCollection('bridge_logs');
    } catch {
        return; // sink not available
    }

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
            latencyMs,
            service: 'smartgpt-bridge',
            operationId: reply.context?.schema?.operationId,
        };
        try {
            await logStore.addEntry({
                text: JSON.stringify(entry),
                timestamp: Date.now(),
                metadata: {
                    path: entry.path,
                    method: entry.method,
                    statusCode: entry.statusCode,
                    hasError: !!entry.error,
                    service: entry.service,
                    operationId: entry.operationId,
                },
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
            latencyMs,
            service: 'smartgpt-bridge',
            operationId: reply.context?.schema?.operationId,
        };
        try {
            await logStore.addEntry({
                text: JSON.stringify(entry),
                timestamp: Date.now(),
                metadata: {
                    path: entry.path,
                    method: entry.method,
                    statusCode: entry.statusCode,
                    hasError: !!entry.error,
                    service: entry.service,
                    operationId: entry.operationId,
                },
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
