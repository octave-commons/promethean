import { dualSinkRegistry } from './utils/DualSinkRegistry.js';

export function registerSinks() {
    if (dualSinkRegistry.list().length) return;

    dualSinkRegistry.register(
        'bridge_logs',
        {
            requestId: String,
            method: String,
            path: String,
            statusCode: Number,
            request: Object,
            response: Object,
            error: String,
            latencyMs: Number,
            service: String,
            operationId: String,
        },
        (doc) => ({
            path: doc.path,
            method: doc.method,
            statusCode: doc.statusCode,
            hasError: !!doc.error,
            createdAt: doc.createdAt.toISOString(),
            service: doc.service,
            operationId: doc.operationId,
        }),
    );

    dualSinkRegistry.register(
        'bridge_searches',
        {
            query: String,
            results: Array,
            service: { type: String, default: 'duckduckgo' },
        },
        (doc) => ({
            query: doc.query,
            resultCount: doc.results.length,
            service: doc.service,
            createdAt: doc.createdAt.toISOString(),
        }),
    );
}
