import querystring from 'querystring';
import openapi from '../openapi.v1.json' assert { type: 'json' };

function proxy(fastify, method, urlBuilder, payloadBuilder) {
    return async function (req, reply) {
        const url = typeof urlBuilder === 'function' ? urlBuilder(req) : urlBuilder;
        const payload = payloadBuilder ? payloadBuilder(req) : req.body;
        const res = await fastify.inject({ method, url, payload, headers: req.headers });
        reply.code(res.statusCode);
        for (const [k, v] of Object.entries(res.headers)) reply.header(k, v);
        try {
            reply.send(res.json());
        } catch {
            reply.send(res.payload);
        }
    };
}

export function registerV1Routes(fastify) {
    fastify.get('/v1/openapi.json', async (_req, reply) => {
        reply.type('application/json').send(openapi);
    });
    // Files
    fastify.get(
        '/v1/files',
        proxy(fastify, 'GET', (req) => `/files/list?${querystring.stringify(req.query)}`),
    );
    fastify.get(
        '/v1/files/*',
        proxy(
            fastify,
            'GET',
            (req) =>
                `/files/view?${querystring.stringify({ ...req.query, path: req.params['*'] })}`,
        ),
    );
    fastify.post('/v1/files/reindex', proxy(fastify, 'POST', '/files/reindex'));

    // Search
    fastify.post('/v1/search/code', proxy(fastify, 'POST', '/grep'));
    fastify.post('/v1/search/semantic', proxy(fastify, 'POST', '/search'));
    fastify.post('/v1/search/web', proxy(fastify, 'POST', '/search/web'));

    // Symbols
    fastify.post('/v1/symbols/index', proxy(fastify, 'POST', '/symbols/index'));
    fastify.post('/v1/symbols/find', proxy(fastify, 'POST', '/symbols/find'));

    // Indexer
    fastify.get('/v1/indexer', proxy(fastify, 'GET', '/indexer/status'));
    fastify.post('/v1/indexer', async (req, reply) => {
        const { op, path } = req.body || {};
        let url;
        if (op === 'index') url = '/indexer/index';
        else if (op === 'remove') url = '/indexer/remove';
        else if (op === 'reset') url = '/indexer/reset';
        else if (op === 'reindex') url = path ? '/files/reindex' : '/reindex';
        else return reply.code(400).send({ ok: false, error: 'invalid op' });
        const payload = path ? { path } : {};
        const res = await fastify.inject({ method: 'POST', url, payload });
        reply.code(res.statusCode);
        for (const [k, v] of Object.entries(res.headers)) reply.header(k, v);
        try {
            reply.send(res.json());
        } catch {
            reply.send(res.payload);
        }
    });

    // Agents
    fastify.post('/v1/agents', proxy(fastify, 'POST', '/agent/start'));
    fastify.get('/v1/agents', proxy(fastify, 'GET', '/agent/list'));
    fastify.get(
        '/v1/agents/:id',
        proxy(fastify, 'GET', (req) => `/agent/status/${req.params.id}`),
    );
    fastify.get(
        '/v1/agents/:id/logs',
        proxy(
            fastify,
            'GET',
            (req) => `/agent/logs?${querystring.stringify({ ...req.query, id: req.params.id })}`,
        ),
    );
    fastify.get('/v1/agents/:id/stream', async (req, reply) => {
        reply.redirect(307, `/agent/stream?${querystring.stringify({ id: req.params.id })}`);
    });
    fastify.post('/v1/agents/:id', async (req, reply) => {
        const { op, input } = req.body || {};
        let url;
        if (op === 'send') url = '/agent/send';
        else if (op === 'interrupt') url = '/agent/interrupt';
        else if (op === 'resume') url = '/agent/resume';
        else if (op === 'kill') url = '/agent/kill';
        else return reply.code(400).send({ ok: false, error: 'invalid op' });
        const res = await fastify.inject({
            method: 'POST',
            url,
            payload: { id: req.params.id, input },
        });
        reply.code(res.statusCode);
        for (const [k, v] of Object.entries(res.headers)) reply.header(k, v);
        try {
            reply.send(res.json());
        } catch {
            reply.send(res.payload);
        }
    });

    // Exec
    fastify.post('/v1/exec', proxy(fastify, 'POST', '/exec/run'));

    // Sinks
    fastify.get('/v1/sinks', proxy(fastify, 'GET', '/sinks/list'));
    fastify.post(
        '/v1/sinks/:name',
        proxy(
            fastify,
            'POST',
            (req) => `/sinks/${req.params.name}/${req.body?.op === 'query' ? 'query' : 'search'}`,
        ),
    );

    // Admin users
    fastify.get('/v1/admin/users', proxy(fastify, 'GET', '/users/list'));
    fastify.post('/v1/admin/users', proxy(fastify, 'POST', '/users/create'));
    fastify.delete(
        '/v1/admin/users/:username',
        proxy(fastify, 'POST', '/users/delete', (req) => ({ username: req.params.username })),
    );

    // Admin policies
    fastify.get('/v1/admin/policies', proxy(fastify, 'GET', '/policies/list'));
    fastify.post('/v1/admin/policies', proxy(fastify, 'POST', '/policies/create'));
    fastify.delete(
        '/v1/admin/policies/:id',
        proxy(fastify, 'POST', '/policies/delete', (req) => ({ id: req.params.id })),
    );
}
