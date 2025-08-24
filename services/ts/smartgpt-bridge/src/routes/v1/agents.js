import querystring from 'querystring';
import { proxy } from './proxy.js';

export function registerAgentRoutes(v1) {
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
            (req) => `/agent/logs?${querystring.stringify({ ...req.query, id: req.params.id })}`,
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
            reply.redirect(307, `/agent/stream?${querystring.stringify({ id: req.params.id })}`);
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
}
