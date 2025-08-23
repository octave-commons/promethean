import querystring from 'querystring';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { dualSinkRegistry } from '../utils/DualSinkRegistry.js';
import { listDirectory } from '../files.js';
import fetch from 'node-fetch';

/** internal helper to proxy into existing internal endpoints while keeping v1 contracts here */
function proxy(_fastify, method, urlBuilder, payloadBuilder) {
    return async function (req, reply) {
        const urlPath = typeof urlBuilder === 'function' ? urlBuilder(req) : urlBuilder;
        const payload = payloadBuilder ? payloadBuilder(req) : req.body;
        const baseUrl =
            process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
        const url = baseUrl.replace(/\/$/, '') + urlPath;
        const fetchOpts = {
            method,
            headers: { ...req.headers },
        };
        if (payload && method !== 'GET') {
            fetchOpts.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
            if (!fetchOpts.headers['content-type']) {
                fetchOpts.headers['content-type'] = 'application/json';
            }
        }
        const res = await fetch(url, fetchOpts);
        reply.code(res.status);
        for (const [k, v] of res.headers.entries()) reply.header(k, v);
        let data;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await res.json();
        } else {
            data = await res.text();
        }
        reply.send(data);
    };
}

export async function registerV1Routes(app) {
    // Everything defined in here will be reachable under /v1 because of the prefix in fastifyApp.js
    await app.register(async function v1(v1) {
        // Swagger JUST for v1 (encapsulation keeps it scoped)

        const baseUrl =
            process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
        const authEnabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
        const swaggerOpts = {
            openapi: {
                openapi: '3.1.0',
                info: { title: 'Promethean SmartGPT Bridge — v1', version: '1.1.0' },
                servers: [{ url: baseUrl }],
            },
            exposeRoute: true,
        };

        if (authEnabled) {
            swaggerOpts.openapi.components = {
                securitySchemes: {
                    apiKey: {
                        type: 'apiKey',
                        name: 'x-pi-token',
                        in: 'header',
                    },
                },
            };
            swaggerOpts.openapi.security = [{ apiKey: [] }];
        }
        await v1.register(swagger, swaggerOpts);

        await v1.register(swaggerUi, {
            routePrefix: '/docs', // -> /v1/docs
            uiConfig: { docExpansion: 'list' },
        });

        // expose the generated v1 spec
        v1.get('/openapi.json', { schema: { hide: true } }, async (_req, reply) => {
            reply.type('application/json').send(v1.swagger());
        });

        // ------------------------------------------------------------------
        // Files
        // ------------------------------------------------------------------
        v1.get('/files', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
            schema: {
                summary: 'List files in a directory or tree',
                operationId: 'listFiles',
                tags: ['Files'],
                querystring: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', default: '.' },
                        hidden: { type: 'boolean', default: false },
                        type: { type: 'string', enum: ['file', 'dir'] },
                        depth: { type: 'integer', minimum: 0, default: 2 },
                        tree: { type: 'boolean', default: false },
                    },
                },
                response: {
                    200: {
                        oneOf: [
                            {
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
                            {
                                type: 'object',
                                properties: {
                                    ok: { type: 'boolean' },
                                    base: { type: 'string' },
                                    tree: { type: 'array', items: { type: 'object' } },
                                },
                            },
                        ],
                    },
                },
            },
            async handler(req, reply) {
                const q = req.query || {};
                const dir = String(q.path || '.');
                const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
                const type = q.type ? String(q.type) : undefined;
                const depth = typeof q.depth === 'number' ? q.depth : Number(q.depth || 2);
                const wantTree = String(q.tree || 'false').toLowerCase() === 'true';
                try {
                    const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
                    const { treeDirectory } = await import('../files.js');
                    if (wantTree) {
                        const treeResult = await treeDirectory(ROOT_PATH, dir, {
                            includeHidden: hidden,
                            depth,
                            type,
                        });
                        reply.send(treeResult);
                    } else {
                        // flat recursive listing up to depth
                        const treeResult = await treeDirectory(ROOT_PATH, dir, {
                            includeHidden: hidden,
                            depth,
                            type,
                        });
                        const flat = [];
                        function walkFlat(node) {
                            if (node.path !== undefined && node.type !== undefined) {
                                // skip root node if it's "."
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
                } catch (e) {
                    reply.code(400).send({ ok: false, error: String(e?.message || e) });
                }
            },
        });

        v1.get('/files/*', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
            schema: {
                summary: 'View file',
                operationId: 'viewFile',
                tags: ['Files'],
                params: {
                    type: 'object',
                    properties: { '*': { type: 'string' } },
                    required: ['*'],
                },
            },
            handler: proxy(
                v1,
                'GET',
                (req) =>
                    `/files/view?${querystring.stringify({ ...req.query, path: req.params['*'] })}`,
            ),
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
            handler: proxy(v1, 'POST', '/files/reindex'),
        });

        // ------------------------------------------------------------------
        // Search
        // ------------------------------------------------------------------
        v1.post('/search/code', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'code')],
            schema: {
                summary: 'Grep code',
                operationId: 'grepCode',
                tags: ['Search'],
                body: {
                    type: 'object',
                    required: ['pattern'],
                    properties: {
                        pattern: { type: 'string' },
                        path: { type: 'string' },
                        flags: { type: 'string' },
                    },
                },
            },
            handler: proxy(v1, 'POST', '/grep'),
        });

        v1.post('/search/semantic', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'search')],
            schema: {
                summary: 'Semantic search (default sink)',
                operationId: 'semanticSearch',
                tags: ['Search'],
                body: {
                    type: 'object',
                    required: ['q'],
                    properties: {
                        q: { type: 'string' },
                        n: { type: 'integer', default: 10 },
                        where: { type: 'object' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            results: { type: 'array', items: { type: 'object' } },
                        },
                    },
                },
            },
            handler: proxy(v1, 'POST', '/search'),
        });

        v1.post('/search/web', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'web-search')],
            schema: {
                summary: 'Web search',
                operationId: 'webSearch',
                tags: ['Search'],
                body: {
                    type: 'object',
                    required: ['q'],
                    properties: {
                        q: { type: 'string' },
                        n: { type: 'integer', default: 10, description: 'Max results' },
                        lang: { type: 'string', description: 'Prefered Language (BCP-47)' },
                        site: { type: 'string', description: 'Optional site/domain filter' },
                    },
                },
            },
            handler: proxy(v1, 'POST', '/search/web'),
        });

        // ------------------------------------------------------------------
        // Sinks (your concrete example, with schema)
        // ------------------------------------------------------------------
        v1.get('/sinks', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'sinks')],
            schema: {
                summary: 'List sinks',
                operationId: 'listSinks',
                tags: ['Sinks'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                            sinks: { type: 'array', items: { type: 'string' } },
                        },
                    },
                },
            },
            handler: proxy(v1, 'GET', '/sinks/list'),
        });

        v1.post('/sinks/:name/search', {
            preHandler: [v1.authUser, v1.requirePolicy('read', (req) => req.params.name)],
            schema: {
                summary: 'Semantic search in sink (Chroma)',
                operationId: 'searchSink',
                tags: ['Sinks'],
                params: {
                    type: 'object',
                    required: ['name'],
                    properties: { name: { type: 'string' } },
                },
                body: {
                    type: 'object',
                    required: ['q'],
                    properties: {
                        q: { type: 'string' },
                        n: { type: 'integer', default: 10 },
                        where: { type: 'object' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            results: { type: 'array', items: { type: 'object' } },
                        },
                    },
                },
            },
            async handler(req) {
                const { name } = req.params;
                const { q, n, where } = req.body || {};
                const sink = dualSinkRegistry.get(name);
                const results = await sink.searchChroma(q, n || 10, where || {});
                return { results };
            },
        });

        // ------------------------------------------------------------------
        // Indexer
        // ------------------------------------------------------------------
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

        // ------------------------------------------------------------------
        // Agents
        // ------------------------------------------------------------------
        v1.get('/agents', {
            preHandler: [v1.authUser, v1.requirePolicy('read', () => 'agents')],
            schema: {
                summary: 'List agents',
                operationId: 'listAgents',
                tags: ['Agents'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                            agents: { type: 'array', items: { type: 'object' } },
                        },
                    },
                },
            },
            handler: proxy(v1, 'GET', '/agent/list'),
        });

        v1.post('/agents', {
            preHandler: [v1.authUser, v1.requirePolicy('write', () => 'agents')],
            schema: {
                summary: 'Start an agent',
                operationId: 'startAgent',
                tags: ['Agents'],
                body: {
                    type: 'object',
                    description: 'Parameters used to start an agent instance',
                    // Keep it generic but valid for OpenAPI generators:
                    // declare an object with no fixed fields, but at least one key.
                    properties: {},
                    additionalProperties: true,
                    minProperties: 1,
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                            id: { type: 'string' },
                        },
                    },
                },
            },
            handler: proxy(v1, 'POST', '/agent/start'),
        });

        v1.get('/agents/:id', {
            preHandler: [v1.authUser, v1.requirePolicy('read', (req) => `agent:${req.params.id}`)],
            schema: {
                summary: 'Get agent status',
                operationId: 'getAgentStatus',
                tags: ['Agents'],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string' } },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                            status: { type: 'string' },
                            agent: { type: 'object' },
                        },
                    },
                },
            },
            handler: proxy(v1, 'GET', (req) => `/agent/status/${req.params.id}`),
        });

        v1.get('/agents/:id/logs', {
            preHandler: [v1.authUser, v1.requirePolicy('read', (req) => `agent:${req.params.id}`)],
            schema: {
                summary: 'Get agent logs',
                operationId: 'getAgentLogs',
                tags: ['Agents'],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string' } },
                },
                querystring: {
                    type: 'object',
                    properties: {
                        tail: { type: 'integer', minimum: 1, maximum: 5000, default: 500 },
                        level: {
                            type: 'string',
                            enum: ['debug', 'info', 'warn', 'error'],
                            nullable: true,
                        },
                    },
                },
            },
            handler: proxy(
                v1,
                'GET',
                (req) =>
                    `/agent/logs?${querystring.stringify({ ...req.query, id: req.params.id })}`,
            ),
        });

        v1.get('/agents/:id/stream', {
            preHandler: [v1.authUser, v1.requirePolicy('read', (req) => `agent:${req.params.id}`)],
            schema: {
                summary: 'Stream agent logs (SSE)',
                operationId: 'streamAgentLogs',
                tags: ['Agents'],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string' } },
                },
            },
            async handler(req, reply) {
                reply.redirect(
                    307,
                    `/agent/stream?${querystring.stringify({ id: req.params.id })}`,
                );
            },
        });

        v1.post('/agents/:id', {
            preHandler: [v1.authUser, v1.requirePolicy('write', (req) => `agent:${req.params.id}`)],
            schema: {
                summary: 'Control agent',
                operationId: 'controlAgent',
                tags: ['Agents'],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string' } },
                },
                body: {
                    type: 'object',
                    required: ['op'],
                    properties: {
                        op: { type: 'string', enum: ['send', 'interrupt', 'resume', 'kill'] },
                        input: {
                            type: 'string',
                            nullable: true,
                            description: 'Message for op=send',
                        },
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
                const { op, input } = req.body || {};
                let url;
                if (op === 'send') url = '/agent/send';
                else if (op === 'interrupt') url = '/agent/interrupt';
                else if (op === 'resume') url = '/agent/resume';
                else if (op === 'kill') url = '/agent/kill';
                else return reply.code(400).send({ ok: false, error: 'invalid op' });
                const res = await v1.inject({
                    method: 'POST',
                    url,
                    payload: { id: req.params.id, input },
                    headers: req.headers,
                });
                reply.code(res.statusCode);
                for (const [k, v] of Object.entries(res.headers)) reply.header(k, v);
                try {
                    reply.send(res.json());
                } catch {
                    reply.send(res.payload);
                }
            },
        });
    });
}
