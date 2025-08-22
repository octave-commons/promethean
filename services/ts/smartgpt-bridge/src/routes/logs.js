import { Log } from '../logModel.js';
import { getLogCollection } from '../logging/index.js';

export function registerLogRoutes(app) {
    app.post(
        '/logs/query',
        {
            schema: {
                summary: 'Query structured logs',
                operationId: 'queryLogs',
                tags: ['Logs'],
                body: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                        method: { type: 'string' },
                        statusCode: { type: 'integer' },
                        since: { type: 'string' },
                        until: { type: 'string' },
                    },
                },
            },
        },
        async (req) => {
            const { path, method, statusCode, since, until } = req.body || {};
            const query = {};
            if (path) query.path = path;
            if (method) query.method = method.toUpperCase();
            if (statusCode) query.statusCode = statusCode;
            if (since || until) query.createdAt = {};
            if (since) query.createdAt.$gte = new Date(since);
            if (until) query.createdAt.$lte = new Date(until);
            return Log.find(query).sort({ createdAt: -1 }).limit(100);
        },
    );

    app.post(
        '/logs/search',
        {
            schema: {
                summary: 'Semantic + metadata-aware search logs',
                operationId: 'semanticLogSearch',
                tags: ['Logs'],
                body: {
                    type: 'object',
                    required: ['q'],
                    properties: {
                        q: { type: 'string' },
                        n: { type: 'integer', default: 10 },
                        where: { type: 'object' },
                    },
                },
            },
        },
        async (req) => {
            const { q, n, where } = req.body;
            const col = await getLogCollection();
            return col.query({ queryTexts: [q], nResults: n || 10, where: where || {} });
        },
    );
}
