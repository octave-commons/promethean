import { indexerManager } from '../indexer.js';

export function registerIndexerRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;

    fastify.post('/reindex', async (_req, reply) => {
        try {
            const r = await indexerManager.scheduleReindexAll();
            reply.send(r);
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.post('/files/reindex', async (req, reply) => {
        try {
            const globs = req.body?.path ?? req.query?.path;
            if (!globs) return reply.code(400).send({ ok: false, error: "Missing 'path'" });
            const r = await indexerManager.scheduleReindexSubset(globs);
            reply.send(r);
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.get('/indexer/status', async (_req, reply) => {
        try {
            reply.send({ ok: true, status: indexerManager.status() });
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.post('/indexer/index', async (req, reply) => {
        try {
            const p = req.body?.path;
            if (!p) return reply.code(400).send({ ok: false, error: 'Missing path' });
            const r = await indexerManager.scheduleIndexFile(String(p));
            reply.send(r);
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.post('/indexer/remove', async (req, reply) => {
        try {
            const p = req.body?.path;
            if (!p) return reply.code(400).send({ ok: false, error: 'Missing path' });
            const rel = String(p);
            const out = await indexerManager.removeFile(rel);
            reply.send(out);
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });

    fastify.post('/indexer/reset', async (_req, reply) => {
        try {
            if (indexerManager.isBusy())
                return reply.code(409).send({ ok: false, error: 'Indexer busy' });
            await indexerManager.resetAndBootstrap(ROOT_PATH);
            reply.send({ ok: true });
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });
}
