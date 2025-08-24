import { symbolsIndex, symbolsFind } from '../../symbols.js';

export function registerSymbolsRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;
    fastify.post('/symbols/index', {
        schema: {
            summary: 'Index project symbols',
            operationId: 'indexSymbols',
            tags: ['Symbols'],
            body: {
                type: 'object',
                properties: {
                    paths: { type: ['array', 'null'], items: { type: 'string' } },
                    exclude: { type: ['array', 'null'], items: { type: 'string' } },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        indexed: { type: 'integer' },
                        info: { type: 'integer' },
                    },
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const { paths, exclude } = req.body || {};
                const info = await symbolsIndex(ROOT_PATH, { paths, exclude });
                // `symbolsIndex` returns an object with counts; expose the totals
                // explicitly to match the declared response schema.
                reply.send({ ok: true, indexed: info.files, info: info.symbols });
            } catch (e) {
                reply.code(500).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });
    fastify.post('/symbols/find', {
        schema: {
            summary: 'Find indexed symbols',
            operationId: 'findSymbols',
            tags: ['Symbols'],
            body: {
                type: 'object',
                required: ['query'],
                properties: {
                    query: { type: 'string' },
                    kind: { type: 'string' },
                    path: { type: 'string' },
                    limit: { type: 'integer' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        results: { type: 'array', items: { $ref: 'SymbolResult#' } },
                    },
                    additionalProperties: false,
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const { query, kind, path: p, limit } = req.body || {};
                const results = await symbolsFind(query, { kind, path: p, limit });
                reply.send({ ok: true, results });
            } catch (e) {
                reply.code(400).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });
}
