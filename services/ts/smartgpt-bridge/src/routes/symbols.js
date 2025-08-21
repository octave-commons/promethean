import { symbolsIndex, symbolsFind } from '../symbols.js';

export function registerSymbolsRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;
    fastify.post('/symbols/index', async (req, reply) => {
        try {
            const { paths, exclude } = req.body || {};
            const info = await symbolsIndex(ROOT_PATH, { paths, exclude });
            reply.send({ ok: true, indexed: info, info });
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });
    fastify.post('/symbols/find', async (req, reply) => {
        try {
            const { query, kind, path: p, limit } = req.body || {};
            const results = await symbolsFind(query, { kind, path: p, limit });
            reply.send({ ok: true, results });
        } catch (e) {
            reply.code(400).send({ ok: false, error: String(e?.message || e) });
        }
    });
}
