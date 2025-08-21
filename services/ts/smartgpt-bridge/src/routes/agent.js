import { supervisor, ptySupervisor } from '../agent.js';

export function registerAgentRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;

    fastify.post('/agent/start', async (req, reply) => {
        try {
            const { prompt, args, cwd, env, auto, tty } = req.body || {};
            const out = supervisor.start({
                prompt,
                args,
                cwd: cwd || ROOT_PATH,
                env,
                auto,
                tty,
            });
            reply.send({ ok: true, ...out });
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.get('/agent/status', async (req, reply) => {
        const id = String(req.query?.id || '');
        const status = supervisor.status(id);
        if (!status) return reply.code(404).send({ ok: false, error: 'not found' });
        reply.send({ ok: true, status });
    });

    fastify.get('/agent/list', async (_req, reply) => {
        reply.send({ ok: true, agents: supervisor.list() });
    });

    fastify.get('/agent/logs', async (req, reply) => {
        const id = String(req.query?.id || '');
        const since = Number(req.query?.since || 0);
        const r = supervisor.logs(id, since);
        if (!r) return reply.code(404).send({ ok: false, error: 'not found' });
        reply.send({ ok: true, ...r });
    });

    fastify.get('/agent/tail', async (req, reply) => {
        const id = String(req.query?.id || '');
        const bytes = Number(req.query?.bytes || 8192);
        const r = supervisor.tail(id, bytes);
        if (!r) return reply.code(404).send({ ok: false, error: 'not found' });
        reply.send({ ok: true, ...r });
    });

    fastify.get('/agent/stream', async (req, reply) => {
        const id = String(req.query?.id || '');
        if (!id) return reply.code(400).send();
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        supervisor.stream(id, reply.raw);
    });

    fastify.post('/agent/send', async (req, reply) => {
        const { id, input } = req.body || {};
        if (!id) return reply.code(400).send({ ok: false, error: 'missing id' });
        const ok = supervisor.send(String(id), String(input || ''));
        reply.send({ ok });
    });

    fastify.post('/agent/interrupt', async (req, reply) => {
        const { id } = req.body || {};
        const ok = supervisor.interrupt(String(id || ''));
        reply.send({ ok });
    });

    fastify.post('/agent/kill', async (req, reply) => {
        const { id, force } = req.body || {};
        const ok = supervisor.kill(String(id || ''), Boolean(force));
        reply.send({ ok });
    });

    fastify.post('/agent/resume', async (req, reply) => {
        const { id } = req.body || {};
        const ok = supervisor.resume(String(id || ''));
        reply.send({ ok });
    });
}
