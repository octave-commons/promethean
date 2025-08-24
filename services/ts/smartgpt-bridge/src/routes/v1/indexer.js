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
                        status: { type: 'object', additionalProperties: true },
                        lastIndexedAt: { type: 'string', format: 'date-time', nullable: true },
                        stats: { type: 'object', additionalProperties: true, nullable: true },
                    },
                },
            },
        },
        async handler() {
            return { ok: true, status: indexerManager.status() };
        },
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
            const { op, path: p } = req.body || {};
            try {
                if (op === 'index') {
                    if (!p) return reply.code(400).send({ ok: false, error: 'missing path' });
                    const r = await indexerManager.scheduleIndexFile(String(p));
                    return reply.send(r);
                } else if (op === 'remove') {
                    if (!p) return reply.code(400).send({ ok: false, error: 'missing path' });
                    const r = await indexerManager.removeFile(String(p));
                    return reply.send(r);
                } else if (op === 'reset') {
                    if (indexerManager.isBusy())
                        return reply.code(409).send({ ok: false, error: 'Indexer busy' });
                    await indexerManager.resetAndBootstrap(ROOT_PATH);
                    return reply.send({ ok: true });
                } else if (op === 'reindex') {
                    if (p) {
                        const r = await indexerManager.scheduleReindexSubset(p);
                        return reply.send(r);
                    } else {
                        const r = await indexerManager.scheduleReindexAll();
                        return reply.send(r);
                    }
                }
                return reply.code(400).send({ ok: false, error: 'invalid op' });
            } catch (e) {
                reply.code(500).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });
}
