import path from 'path';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { listDirectory, viewFile } from '../files.js';
import { grep } from '../grep.js';
import { indexerManager, search as semanticSearch } from '../indexer.js';
import { dualSinkRegistry } from '../utils/DualSinkRegistry.js';
import { AgentSupervisor as NewAgentSupervisor } from '../agentSupervisor.js';
import { supervisor as defaultSupervisor } from '../agent.js';
import { search } from 'duckduckgo-search';
const ddgSearch = search;

// Agent supervisor helpers (mirrors logic from routes/agent.js)
const SUPS = new Map();
const DEFAULT_KEY = 'default';
const NSJAIL_KEY = 'nsjail';
const AGENT_INDEX = new Map();

function getSup(fastify, key) {
    const k = key === 'nsjail' ? NSJAIL_KEY : DEFAULT_KEY;
    if (SUPS.has(k)) return SUPS.get(k);
    if (k === DEFAULT_KEY) {
        SUPS.set(k, defaultSupervisor);
        return defaultSupervisor;
    }
    const ROOT_PATH = fastify.ROOT_PATH;
    const logDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../logs/agents');
    const sup = new NewAgentSupervisor({
        cwd: ROOT_PATH,
        logDir,
        sandbox: k === NSJAIL_KEY ? 'nsjail' : false,
    });
    SUPS.set(k, sup);
    return sup;
}

// DuckDuckGo result normaliser (lifted from routes/search.js)
function extractResults(data) {
    console.log(data);
    const results = [];
    if (data?.Results) {
        for (const r of data.Results) {
            if (r.Text && r.FirstURL)
                results.push({ title: r.Text, url: r.FirstURL, snippet: r.Text });
        }
    }
    if (data?.RelatedTopics) {
        for (const item of data.RelatedTopics) {
            if (item.Topics) {
                for (const sub of item.Topics) {
                    if (sub.Text && sub.FirstURL)
                        results.push({ title: sub.Text, url: sub.FirstURL, snippet: sub.Text });
                }
            } else if (item.Text && item.FirstURL) {
                results.push({ title: item.Text, url: item.FirstURL, snippet: item.Text });
            }
        }
    }
    if (data?.AbstractURL && data?.AbstractText) {
        results.push({
            title: data.Heading || data.AbstractURL,
            url: data.AbstractURL,
            snippet: data.AbstractText,
        });
    }
    return results;
}

export async function registerV1Routes(app) {
    await app.register(async function v1(v1) {
        const ROOT_PATH = v1.ROOT_PATH;

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
            routePrefix: '/docs',
            uiConfig: { docExpansion: 'list' },
        });

        v1.get('/openapi.json', { schema: { hide: true } }, async (_req, reply) => {
            reply.type('application/json').send(v1.swagger());
        });

        // ------------------------------------------------------------------
        // Files
        // Unified handler for /files and /files/*
        async function filesHandler(req, reply) {
            const q = req.query || {};
            // Prefer path param if present, else use ?path= query
            const p = req.params && (req.params['*'] || req.params.path);
            const dir = p || String(q.path || '.');
            const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
            const type = q.type ? String(q.type) : undefined;
            const depth = typeof q.depth === 'number' ? q.depth : Number(q.depth || 2);
            const wantTree = String(q.tree || 'false').toLowerCase() === 'true';
            const hasLineOrContext = q.line !== undefined || q.context !== undefined;
            const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
            try {
                if (hasLineOrContext || (p && !wantTree && !q.type && !q.hidden && !q.depth)) {
                    // View file
                    const { viewFile } = await import('../files.js');
                    const info = await viewFile(ROOT_PATH, dir, q.line, q.context);
                    reply.send({ ok: true, ...info });
                } else {
                    // Directory listing or tree
                    const { treeDirectory } = await import('../files.js');
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
                        context: { type: 'integer', minimum: 0, default: 25 },
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
                        context: { type: 'integer', minimum: 0, default: 25 },
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
            async handler(req, reply) {
                try {
                    const body = req.body || {};
                    const results = await grep(ROOT_PATH, {
                        pattern: body.pattern,
                        flags: body.flags || 'g',
                        paths: body.path ? [body.path] : undefined,
                        maxMatches: Number(body.maxMatches || 200),
                        context: Number(body.context || 2),
                    });
                    reply.send({ ok: true, results });
                } catch (e) {
                    reply.code(400).send({ ok: false, error: String(e?.message || e) });
                }
            },
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
            async handler(req, reply) {
                try {
                    const { q, n } = req.body || {};
                    if (!q) return reply.code(400).send({ ok: false, error: "Missing 'q'" });
                    const results = await semanticSearch(ROOT_PATH, q, n || 10);
                    const sink = dualSinkRegistry.get('bridge_searches');
                    await sink.add({ query: q, results, service: 'chroma' });
                    reply.send({ results });
                } catch (e) {
                    reply.code(500).send({ ok: false, error: String(e?.message || e) });
                }
            },
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
            async handler(req) {
                const { q, n, lang, site } = req.body || {};
                // Compose query with optional site filter
                let query = q;
                if (site) query = `site:${site} ${q}`;
                const opts = {};
                if (lang) opts.region = lang;
                const results = await ddgSearch(query, { maxResults: n || 10, ...opts });
                // ddgSearch returns an array of {title, url, description}
                return {
                    results: results.map((r) => ({
                        title: r.title,
                        url: r.url,
                        snippet: r.description || r.snippet || '',
                    })),
                };
            },
        });

        // ------------------------------------------------------------------
        // Sinks
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
            async handler() {
                return { ok: true, sinks: dualSinkRegistry.list() };
            },
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
            async handler() {
                const agents = Array.from(AGENT_INDEX.entries()).map(([id, key]) => ({
                    id,
                    sandbox: key,
                }));
                return { ok: true, agents };
            },
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
            async handler(req, reply) {
                try {
                    const { prompt, cwd, env, bypassApprovals, sandbox, tty } = req.body || {};
                    const mode = sandbox === 'nsjail' ? 'nsjail' : 'default';
                    const sup = getSup(v1, mode);
                    const id = sup.start({
                        prompt,
                        env,
                        bypassApprovals: Boolean(bypassApprovals),
                        tty: tty !== false,
                    });
                    AGENT_INDEX.set(id, mode);
                    const status = sup.status(id) || {};
                    reply.send({ ok: true, ...status });
                } catch (e) {
                    const msg = String(e?.message || e || '');
                    if (msg.includes('PTY_UNAVAILABLE'))
                        return reply.code(503).send({ ok: false, error: 'pty_unavailable' });
                    reply.code(500).send({ ok: false, error: msg });
                }
            },
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
            async handler(req, reply) {
                const id = String(req.params.id);
                const key = AGENT_INDEX.get(id);
                const sup = key ? getSup(v1, key) : null;
                let status = sup ? sup.status(id) : null;
                if (!status) {
                    status = getSup(v1, 'default').status(id) || getSup(v1, 'nsjail').status(id);
                }
                if (!status) return reply.code(404).send({ ok: false, error: 'not found' });
                reply.send({ ok: true, status });
            },
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
            async handler(req, reply) {
                const id = String(req.params.id);
                const key = AGENT_INDEX.get(id) || 'default';
                const sup = getSup(v1, key);
                let r;
                try {
                    r = sup.tail(id, Number(req.query?.tail || 500));
                } catch {
                    r = null;
                }
                if (!r) return reply.code(404).send({ ok: false, error: 'not found' });
                reply.send({ ok: true, ...r });
            },
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
                const id = String(req.params.id);
                const key = AGENT_INDEX.get(id) || 'default';
                const sup = getSup(v1, key);
                reply.raw.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                });
                try {
                    const chunk = sup.tail(id, 2048).chunk;
                    reply.raw.write(`event: replay\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
                } catch {}
                const handler = (data) =>
                    reply.raw.write(
                        `event: data\ndata: ${JSON.stringify({ text: String(data) })}\n\n`,
                    );
                sup.on(id, handler);
                req.raw.on('close', () => {
                    try {
                        sup.off(id, handler);
                    } catch {}
                });
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
                const id = String(req.params.id);
                const key = AGENT_INDEX.get(id) || 'default';
                const sup = getSup(v1, key);
                try {
                    if (op === 'send') {
                        sup.send(id, String(input || ''));
                        return reply.send({ ok: true });
                    } else if (op === 'interrupt') {
                        const ok = sup.send(id, '\u0003');
                        return reply.send({ ok: Boolean(ok) });
                    } else if (op === 'resume') {
                        const ok = sup.resume(id);
                        return reply.send({ ok });
                    } else if (op === 'kill') {
                        const ok = sup.kill(id);
                        return reply.send({ ok });
                    }
                    return reply.code(400).send({ ok: false, error: 'invalid op' });
                } catch (e) {
                    reply.send({ ok: false, error: String(e?.message || e) });
                }
            },
        });
    });
}
