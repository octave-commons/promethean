import { proxy } from './proxy.js';

export function registerSearchRoutes(v1) {
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
}
