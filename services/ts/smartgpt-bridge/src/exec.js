import { spawn } from 'child_process';

const MAX_BYTES = Number(process.env.EXEC_MAX_OUTPUT_BYTES || 2 * 1024 * 1024);
const USE_SHELL = /^true$/i.test(process.env.EXEC_SHELL || 'false');
const REPO_ROOT = process.env.REPO_ROOT;

// return exec({cwd,shell:'/usr/bin/bash'})`${command}`
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
import { execa } from 'execa';

export async function runCommand({
    command,
    cwd = REPO_ROOT,
    timeoutMs = 10 * 60_000,
    tty = false,
} = {}) {
    try {
        const subprocess = execa(command, {
            cwd,
            timeout: timeoutMs,
            shell: true,
            stdio: tty ? 'inherit' : 'pipe',
        });

        const result = await subprocess;

        return {
            ok: true,
            exitCode: 0,
            signal: null,
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
            durationMs: result.timedOut ? timeoutMs : result.durationMilliseconds ?? 0,
            truncated: false,
            error: '',
        };
    } catch (err) {
        return {
            ok: false,
            exitCode: err.exitCode ?? 1,
            signal: err.signal ?? null,
            stdout: err.stdout ?? '',
            stderr: err.stderr ?? err.message,
            durationMs: err.timedOut ? timeoutMs : 0,
            truncated: false,
            error: err.message ?? 'Execution failed',
        };
    }
}
