import { viewFile, treeDirectory } from '../../files.js';
import { stat } from 'fs/promises';
import { indexerManager } from '../../indexer.js';

export function registerFilesRoutes(v1) {
    // ------------------------------------------------------------------
    // Files
    // Unified handler for /files and /files/*
    async function filesHandler(req, reply) {
        const q = req.query || {};
        const p = req.params && (req.params['*'] || req.params.path);
        const dir = p || String(q.path || '.');
        const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
        const type = q.type ? String(q.type) : undefined;
        const depth = typeof q.depth === 'number' ? q.depth : Number(q.depth || 2);
        const wantTree = String(q.tree || 'false').toLowerCase() === 'true';
        const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
        try {
            try {
                // Try to view file first
                const info = await viewFile(ROOT_PATH, dir, q.line, q.context);
                reply.send({ ok: true, ...info });
            } catch (viewErr) {
                // catch view error and continue to directory listing
                // Directory listing or tree
                if (wantTree) {
                    const treeResult = await treeDirectory(ROOT_PATH, dir, {
                        includeHidden: hidden,
                        depth,
                        type,
                    });
                    reply.send({
                        ok: true,
                        base: treeResult.base,
                        tree: treeResult.tree,
                    });
                } else {
                    const treeResult = await treeDirectory(ROOT_PATH, dir, {
                        includeHidden: hidden,
                        depth,
                        type,
                    });
                    const flat = [];
                    function walkFlat(node) {
                        if (node.path !== undefined && node.type !== undefined) {
                            if (node.path !== '.' && node.path !== '')
                                flat.push({
                                    name: node.name,
                                    path: node.path,
                                    type: node.type,
                                    size: node.size ?? null,
                                    mtimeMs: node.mtimeMs ?? null,
                                });
                        }
                        if (Array.isArray(node.children)) {
                            for (const child of node.children) walkFlat(child);
                        }
                    }
                    walkFlat(treeResult.tree);
                    reply.send({ ok: true, base: treeResult.base, entries: flat });
                }
            }
        } catch (e) {
            reply.code(400).send({ ok: false, error: String(e?.message || e) });
        }
    }
    // ------------------------------------------------------------------
    v1.get('/files', {
        preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
        schema: {
            summary: 'List files, tree, or view file',
            operationId: 'files',
            tags: ['Files'],
            querystring: {
                type: 'object',
                properties: {
                    path: { type: 'string', default: '.' },
                    hidden: { type: 'boolean', default: false },
                    type: { type: 'string', enum: ['file', 'dir'] },
                    depth: { type: 'integer', minimum: 0, default: 2 },
                    tree: { type: 'boolean', default: false },
                    line: { type: 'integer', minimum: 1 },
                    context: { type: 'integer', minimum: 0 },
                },
            },
        },
        handler: filesHandler,
    });

    v1.get('/files/*', {
        preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
        schema: {
            summary: 'List files, tree, or view file',
            operationId: 'files',
            tags: ['Files'],
            params: {
                type: 'object',
                properties: {
                    '*': { type: 'string' },
                },
            },
            querystring: {
                type: 'object',
                properties: {
                    path: { type: 'string', default: '.' },
                    hidden: { type: 'boolean', default: false },
                    type: { type: 'string', enum: ['file', 'dir'] },
                    depth: { type: 'integer', minimum: 0, default: 2 },
                    tree: { type: 'boolean', default: false },
                    line: { type: 'integer', minimum: 1 },
                    context: { type: 'integer', minimum: 0 },
                },
            },
        },
        handler: filesHandler,
    });

    v1.post('/files/reindex', {
        preHandler: [v1.authUser, v1.requirePolicy('write', () => 'files')],
        schema: {
            summary: 'Reindex files under a path',
            operationId: 'reindexFiles',
            tags: ['Files'],
            body: {
                type: 'object',
                properties: { path: { type: 'string' } },
            },
        },
        async handler(req, reply) {
            try {
                const globs = req.body?.path;
                if (!globs) return reply.code(400).send({ ok: false, error: "Missing 'path'" });
                const r = await indexerManager.scheduleReindexSubset(globs);
                reply.send(r);
            } catch (e) {
                reply.code(500).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });
}
