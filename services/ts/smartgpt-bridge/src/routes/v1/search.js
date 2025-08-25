import { grep } from '../../grep.js';
import { search as semanticSearch } from '../../indexer.js';
import { contextStore } from '../../sinks.js';
// import { search as ddgSearch } from 'duckduckgo-search';

export function registerSearchRoutes(v1) {
    const ROOT_PATH = v1.ROOT_PATH;
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
                        results: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    path: { type: 'string' },
                                    chunkIndex: { type: 'integer' },
                                    startLine: { type: 'integer' },
                                    endLine: { type: 'integer' },
                                    score: { type: 'number' },
                                    text: { type: 'string' },
                                },
                                required: [
                                    'id',
                                    'path',
                                    'chunkIndex',
                                    'startLine',
                                    'endLine',
                                    'score',
                                    'text',
                                ],
                            },
                        },
                    },
                },
            },
        },
        async handler(req, reply) {
            try {
                const { q, n } = req.body || {};
                if (!q) return reply.code(400).send({ ok: false, error: "Missing 'q'" });
                const results = await semanticSearch(ROOT_PATH, q, n || 10);
                try {
                    const store = contextStore.getCollection('bridge_searches');
                    await store.addEntry({
                        text: JSON.stringify({ query: q, results, service: 'chroma' }),
                        timestamp: Date.now(),
                        metadata: { query: q, resultCount: results.length, service: 'chroma' },
                    });
                } catch {}
                console.log(results);
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
}
