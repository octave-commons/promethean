import { listDirectory, viewFile, locateStacktrace } from '../files.js';

export function registerFilesRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;

    fastify.get('/files/list', async (req, reply) => {
        const q = req.query || {};
        const dir = String(q.path || '.');
        const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
        const type = q.type ? String(q.type) : undefined;
        try {
            const out = await listDirectory(ROOT_PATH, dir, { hidden, type });
            reply.send(out);
        } catch (e) {
            reply.code(400).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.get('/files/view', async (req, reply) => {
        const q = req.query || {};
        const p = q.path;
        if (!p) return reply.code(400).send({ ok: false, error: 'Missing path' });
        try {
            const info = await viewFile(
                ROOT_PATH,
                String(p),
                Number(q.line || 1),
                Number(q.context || 25),
            );
            reply.send({ ok: true, ...info });
        } catch (e) {
            reply.code(404).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.post('/stacktrace/locate', async (req, reply) => {
        try {
            const body = req.body || {};
            const text = body.text ?? body.trace ?? '';
            const ctx = Number(body.context || 25);
            const r = await locateStacktrace(ROOT_PATH, String(text), ctx);
            reply.send({ ok: true, results: r });
        } catch (e) {
            reply.code(400).send({ ok: false, error: String(e?.message || e) });
        }
    });
}
