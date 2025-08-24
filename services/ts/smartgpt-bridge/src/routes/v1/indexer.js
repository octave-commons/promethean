import { proxy } from './proxy.js';

export function registerIndexerRoutes(v1) {
    v1.get('/indexer', {
        preHandler: [v1.authUser, v1.requirePolicy('read', () => 'indexer')],
        schema: {
            summary: 'Get indexer status',
            operationId: 'getIndexerStatus',
            tags: ['Indexer'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'string' },
                        lastIndexedAt: { type: 'string', format: 'date-time', nullable: true },
                        stats: { type: 'object', additionalProperties: true, nullable: true },
                    },
                },
            },
        },
        handler: proxy(v1, 'GET', '/indexer/status'),
    });

    v1.post('/indexer', {
        preHandler: [v1.authUser, v1.requirePolicy('write', () => 'indexer')],
        schema: {
            summary: 'Control indexer',
            operationId: 'controlIndexer',
            tags: ['Indexer'],
            body: {
                type: 'object',
                required: ['op'],
                properties: {
                    op: { type: 'string', enum: ['index', 'remove', 'reset', 'reindex'] },
                    path: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        message: { type: 'string', nullable: true },
                    },
                },
                400: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        error: { type: 'string' },
                    },
                },
            },
        },
        async handler(req, reply) {
            const { op, path } = req.body || {};
            let url;
            if (op === 'index') url = '/indexer/index';
            else if (op === 'remove') url = '/indexer/remove';
            else if (op === 'reset') url = '/indexer/reset';
            else if (op === 'reindex') url = path ? '/files/reindex' : '/reindex';
            else return reply.code(400).send({ ok: false, error: 'invalid op' });
            const payload = path ? { path } : {};
            const res = await v1.inject({ method: 'POST', url, payload, headers: req.headers });
            reply.code(res.statusCode);
            for (const [k, v] of Object.entries(res.headers)) reply.header(k, v);
            try {
                reply.send(res.json());
            } catch {
                reply.send(res.payload);
            }
        },
    });
}
