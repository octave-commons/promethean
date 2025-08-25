// @ts-nocheck
import { listDirectory, viewFile, locateStacktrace, treeDirectory } from '../../files.js';

export function registerFilesRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;

    fastify.get('/files/list', {
        schema: {
            summary: 'List files in a directory',
            operationId: 'listFiles',
            tags: ['Files'],
            querystring: {
                type: 'object',
                properties: {
                    path: { type: 'string', default: '.' },
                    hidden: { type: 'boolean', default: false },
                    type: { type: 'string', enum: ['file', 'dir'] },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        base: { type: 'string' },
                        entries: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    path: { type: 'string' },
                                    type: { type: 'string' },
                                    size: { type: ['integer', 'null'] },
                                    mtimeMs: { type: ['number', 'null'] },
                                },
                            },
                        },
                    },
                },
            },
        },
        handler: async (req, reply) => {
            const q = req.query || {};
            const dir = String(q.path || '.');
            const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
            const type = q.type ? String(q.type) : undefined;
            try {
                const out = await listDirectory(ROOT_PATH, dir, { hidden, type });
                reply.send(out);
            } catch (e) {
                reply.code(400).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });

    fastify.get('/files/tree', {
        schema: {
            summary: 'Return directory tree',
            operationId: 'treeFiles',
            tags: ['Files'],
            querystring: {
                type: 'object',
                properties: {
                    path: { type: 'string', default: '.' },
                    depth: { type: 'integer', default: 1 },
                    hidden: { type: 'boolean', default: false },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        base: { type: 'string' },
                        tree: { $ref: 'FileTreeNode#' },
                    },
                    additionalProperties: false,
                },
            },
        },
        handler: async (req, reply) => {
            const q = req.query || {};
            const dir = String(q.path || '.');
            const depth = Number(q.depth || 1);
            const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
            try {
                const out = await treeDirectory(ROOT_PATH, dir, {
                    depth,
                    includeHidden: hidden,
                });
                reply.send(out);
            } catch (e) {
                reply.code(400).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });

    fastify.get('/files/view', {
        schema: {
            summary: 'View a file snippet',
            operationId: 'viewFile',
            tags: ['Files'],
            querystring: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: { type: 'string' },
                    line: { type: 'integer', default: 1 },
                    context: { type: 'integer', default: 25 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        path: { type: 'string' },
                        totalLines: { type: 'integer' },
                        startLine: { type: 'integer' },
                        endLine: { type: 'integer' },
                        focusLine: { type: 'integer' },
                        snippet: { type: 'string' },
                    },
                },
            },
        },
        handler: async (req, reply) => {
            const q = req.query || {};
            const p = q.path;
            if (!p) return reply.code(400).send({ ok: false, error: 'Missing path' });
            try {
                const info = await viewFile(
                    ROOT_PATH,
                    String(p),
                    Number(q.line || 1),
                    Number(q.context || 25),
                );
                reply.send({ ok: true, ...info });
            } catch (e) {
                reply.code(404).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });

    fastify.post('/stacktrace/locate', {
        schema: {
            summary: 'Locate files from a stacktrace',
            operationId: 'locateStacktrace',
            tags: ['Files'],
            body: {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    trace: { type: 'string' },
                    context: { type: 'integer', default: 25 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        results: { type: 'array', items: { $ref: 'StacktraceResult#' } },
                    },
                    additionalProperties: false,
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const body = req.body || {};
                const text = body.text ?? body.trace ?? '';
                const ctx = Number(body.context || 25);
                const r = await locateStacktrace(ROOT_PATH, String(text), ctx);
                reply.send({ ok: true, results: r });
            } catch (e) {
                reply.code(400).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });
}
