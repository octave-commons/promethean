import { runCommand } from '../exec.js';

export function registerExecRoutes(fastify) {
    const ROOT_PATH = fastify.ROOT_PATH;
    fastify.post('/exec/run', async (req, reply) => {
        try {
            const execEnabled =
                String(process.env.EXEC_ENABLED || 'false').toLowerCase() === 'true';
            if (!execEnabled) return reply.code(403).send({ ok: false, error: 'exec disabled' });
            const { command, cwd, env, timeoutMs, tty } = req.body || {};
            console.log({ command, cwd, env, timeoutMs, tty });
            if (!command) return reply.code(400).send({ ok: false, error: "Missing 'command'" });
            const out = await runCommand(String(command), {
                cwd: cwd ? String(cwd) : ROOT_PATH,
                env,
                timeoutMs: Number(timeoutMs || 600000),
                tty: Boolean(tty),
            });
            reply.send(out.ok ? out : { ok: false, ...out });
        } catch (e) {
            reply.code(500).send({ ok: false, error: String(e?.message || e) });
        }
    });
}
