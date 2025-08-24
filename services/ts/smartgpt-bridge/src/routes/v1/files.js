import querystring from 'querystring';
import { proxy } from './proxy.js';

export function registerFilesRoutes(v1) {
    v1.get('/files', {
        preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
        schema: {
            summary: 'List files',
            operationId: 'listFiles',
            tags: ['Files'],
            querystring: {
                type: 'object',
                properties: {
                    path: { type: 'string' },
                    depth: { type: 'integer', minimum: 0, default: 2 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        entries: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
        handler: proxy(v1, 'GET', (req) => `/v0/files/list?${querystring.stringify(req.query)}`),
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
}
