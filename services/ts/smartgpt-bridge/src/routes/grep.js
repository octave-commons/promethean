import { grep } from '../grep.js';

export function registerGrepRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;
    fastify.post('/grep', async (req, reply) => {
        try {
            const body = req.body || {};
            const results = await grep(ROOT_PATH, {
                pattern: body.pattern,
                flags: body.flags || 'g',
                paths: body.paths || ['**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}'],
                maxMatches: Number(body.maxMatches || 200),
                context: Number(body.context || 2),
            });
            reply.send({ ok: true, results });
        } catch (e) {
            reply.code(400).send({ ok: false, error: String(e?.message || e) });
        }
    });
}
