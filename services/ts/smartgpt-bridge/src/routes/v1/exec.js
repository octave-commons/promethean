import { runCommand } from '../../exec.js';

export function registerExecRoutes(v1) {
    const ROOT_PATH = v1.ROOT_PATH;
    v1.post('/exec/run', {
        schema: {
            summary: 'Run a shell command',
            operationId: 'runCommand',
            tags: ['Exec'],
            body: {
                type: 'object',
                required: ['command'],
                properties: {
                    command: { type: 'string' },
                    cwd: { type: 'string' },
                    env: { type: 'object', additionalProperties: { type: 'string' } },
                    timeoutMs: { type: 'integer', default: 600000 },
                    tty: { type: 'boolean', default: false },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        exitCode: { type: ['integer', 'null'] },
                        signal: { type: ['string', 'null'] },
                        stdout: { type: 'string' },
                        stderr: { type: 'string' },
                        error: { type: 'string' },
                    },
                },
                403: {
                    type: 'object',
                    properties: { ok: { type: 'boolean' }, error: { type: 'string' } },
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const execEnabled =
                    String(process.env.EXEC_ENABLED || 'false').toLowerCase() === 'true';
                if (!execEnabled)
                    return reply.code(403).send({ ok: false, error: 'exec disabled' });
                const { command, cwd, env, timeoutMs, tty } = req.body || {};
                console.log({ command, cwd, env, timeoutMs, tty });
                if (!command)
                    return reply.code(400).send({ ok: false, error: "Missing 'command'" });
                const out = await runCommand({
                    command: String(command),
                    cwd: cwd ? String(cwd) : ROOT_PATH,
                    repoRoot: ROOT_PATH,
                    env,
                    timeoutMs: Number(timeoutMs || 600000),
                    tty: Boolean(tty),
                });
                reply.send(out.ok ? out : { ok: false, ...out });
            } catch (e) {
                reply.code(500).send({ ok: false, error: String(e?.message || e) });
            }
        },
    });
}
