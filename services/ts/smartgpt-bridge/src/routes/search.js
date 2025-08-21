import { search } from '../indexer.js';

export function registerSearchRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;
    fastify.post('/search', async (req, reply) => {
        try {
            const { q, n } = req.body || {};
            if (!q) return reply.code(400).send({ ok: false, error: "Missing 'q'" });
            const results = await search(ROOT_PATH, q, n ?? 8);
            reply.send({ ok: true, results });
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });
}
