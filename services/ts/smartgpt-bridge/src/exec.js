import { spawn } from 'child_process';

const MAX_BYTES = Number(process.env.EXEC_MAX_OUTPUT_BYTES || 2 * 1024 * 1024);
const USE_SHELL = /^true$/i.test(process.env.EXEC_SHELL || 'false');

const DANGER_PATTERNS = [
    /rm\s+-rf\s+\/(?!home)/i,
    /\bDROP\s+DATABASE\b/i,
    /\bmkfs\w*\s+\/dev\//i,
    /\bshutdown\b|\breboot\b/i,
    /\bchmod\s+777\b/i,
];
function matchDanger(s) {
    return DANGER_PATTERNS.find((rx) => rx.test(s));
}

function ringPush(buf, chunk) {
    const slice = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    const combined = Buffer.concat([buf, slice]);
    if (combined.length <= MAX_BYTES) return combined;
    return combined.subarray(combined.length - MAX_BYTES);
}

export async function runCommand({
    command,
    cwd = process.cwd(),
    env = {},
    timeoutMs = 10 * 60 * 1000,
    tty = false,
}) {
    if (!command || typeof command !== 'string') {
        return { ok: false, error: 'Missing command' };
    }
    const danger = matchDanger(command);
    if (danger) return { ok: false, error: `Blocked by guard: ${danger}` };

    const start = Date.now();
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);

    const child = (() => {
        if (tty) {
            // Allocate a pty using 'script'; run command via shell
            const cmd = ['-lc', command].join(' ');
            return spawn('script', ['-qfec', `bash -lc ${JSON.stringify(command)}`, '/dev/null'], {
                cwd,
                env: { ...process.env, CI: '1', GIT_TERMINAL_PROMPT: '0', ...env },
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: false,
            });
        }
        // Non-tty: use bash -lc for consistent behavior
        return spawn('bash', ['-lc', command], {
            cwd,
            env: { ...process.env, CI: '1', GIT_TERMINAL_PROMPT: '0', ...env },
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: USE_SHELL,
        });
    })();

    let timer = null;
    const done = new Promise((resolve) => {
        child.stdout.on('data', (d) => {
            stdout = ringPush(stdout, d);
        });
        child.stderr.on('data', (d) => {
            stderr = ringPush(stderr, d);
        });
        child.on('error', (err) => {
            clearTimeout(timer);
            resolve({
                ok: false,
                error: String(err?.message || err),
                stdout: stdout.toString('utf8'),
                stderr: stderr.toString('utf8'),
                durationMs: Date.now() - start,
            });
        });
        child.on('exit', (code, signal) => {
            clearTimeout(timer);
            resolve({
                ok: true,
                exitCode: code,
                signal,
                stdout: stdout.toString('utf8'),
                stderr: stderr.toString('utf8'),
                durationMs: Date.now() - start,
                truncated: stdout.length >= MAX_BYTES || stderr.length >= MAX_BYTES,
            });
        });
    });

    if (timeoutMs && timeoutMs > 0) {
        timer = setTimeout(() => {
            try {
                child.kill('SIGKILL');
            } catch {}
        }, timeoutMs);
    }

    return await done;
}
