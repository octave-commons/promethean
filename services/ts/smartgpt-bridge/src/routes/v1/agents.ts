// @ts-nocheck
import querystring from 'querystring';
import { proxy } from './proxy.js';

export function registerAgentRoutes(v1) {
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
                reply.raw.write(`event: data\ndata: ${JSON.stringify({ text: String(data) })}\n\n`);
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
}
