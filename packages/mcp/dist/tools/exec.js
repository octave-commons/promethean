import { spawn } from 'node:child_process';
import { z } from 'zod';
import { loadApprovedExecConfig } from '../config/load-exec-config.js';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_FORCE_KILL_DELAY_MS = 5_000;
const ExecInputSchema = z.object({
    commandId: z.string(),
    args: z.array(z.string()).optional(),
    timeoutMs: z.number().int().positive().optional(),
});
const resolveWorkingDirectory = (command, options) => {
    if (command.cwd) {
        return command.cwd;
    }
    if (options.defaultCwd) {
        return options.defaultCwd;
    }
    if (options.rootFromEnv) {
        return options.rootFromEnv;
    }
    return process.cwd();
};
const buildArgs = (command, extra) => {
    const base = command.args ?? [];
    if (!extra || extra.length === 0) {
        return base;
    }
    if (!command.allowExtraArgs) {
        throw new Error(`Command ${command.id} does not permit overriding args.`);
    }
    return [...base, ...extra];
};
const computeTimeouts = (command, configDefaults, requestedTimeout) => {
    const timeoutMs = requestedTimeout ?? command.timeoutMs ?? configDefaults.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const forceKillDelayMs = configDefaults.forceKillDelayMs ?? DEFAULT_FORCE_KILL_DELAY_MS;
    return { timeoutMs, forceKillDelayMs };
};
const sanitizeEnv = (env) => Object.fromEntries(Object.entries(env).filter((entry) => typeof entry[1] === 'string'));
/* eslint-disable functional/no-let */
const collectStream = (stream) => {
    if (!stream) {
        return Promise.resolve('');
    }
    return new Promise((resolve, reject) => {
        stream.setEncoding('utf8');
        let combined = '';
        const cleanup = () => {
            stream.off('error', onError);
            stream.off('end', onEnd);
            stream.off('close', onEnd);
            stream.off('data', onData);
        };
        const onEnd = () => {
            cleanup();
            resolve(combined);
        };
        const onError = (err) => {
            cleanup();
            reject(err);
        };
        const onData = (chunk) => {
            const text = typeof chunk === 'string'
                ? chunk
                : Buffer.isBuffer(chunk)
                    ? chunk.toString('utf8')
                    : String(chunk);
            combined += text;
        };
        stream.on('data', onData);
        stream.once('error', onError);
        stream.once('end', onEnd);
        stream.once('close', onEnd);
    });
};
/* eslint-enable functional/no-let */
const startTimeout = (child, options, completion) => {
    if (!options.timeoutMs || options.timeoutMs <= 0) {
        return Promise.resolve(false);
    }
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            child.kill('SIGTERM');
            if (options.forceKillDelayMs && options.forceKillDelayMs > 0) {
                const killTimer = setTimeout(() => {
                    child.kill('SIGKILL');
                }, options.forceKillDelayMs);
                killTimer.unref();
            }
            resolve(true);
        }, options.timeoutMs);
        timer.unref();
        void completion.finally(() => {
            clearTimeout(timer);
            resolve(false);
        });
    });
};
const spawnApprovedCommand = (command, args, cwd, env) => {
    const child = spawn(command.command, args, {
        cwd,
        env: {
            ...process.env,
            ...sanitizeEnv(env),
            ...(command.env ?? {}),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    const completion = new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (exitCode, signal) => {
            resolve({ exitCode, signal });
        });
    });
    return {
        child,
        completion,
        stdout: collectStream(child.stdout),
        stderr: collectStream(child.stderr),
    };
};
const awaitCommandResult = async (spawned, timeouts) => {
    const timeoutTriggered = await startTimeout(spawned.child, timeouts, spawned.completion);
    const [stdout, stderr, result] = await Promise.all([
        spawned.stdout,
        spawned.stderr,
        spawned.completion,
    ]);
    return { stdout, stderr, result, timeoutTriggered };
};
const runApprovedCommand = async (command, inputArgs, options) => {
    const finalArgs = buildArgs(command, inputArgs);
    const cwd = resolveWorkingDirectory(command, {
        defaultCwd: options.defaultCwd,
        rootFromEnv: options.rootFromEnv,
    });
    const start = Date.now();
    const spawned = spawnApprovedCommand(command, finalArgs, cwd, options.env);
    const { stdout, stderr, result, timeoutTriggered } = await awaitCommandResult(spawned, {
        timeoutMs: options.timeoutMs,
        forceKillDelayMs: options.forceKillDelayMs,
    });
    return {
        commandId: command.id,
        command: command.command,
        args: finalArgs,
        cwd,
        exitCode: result.exitCode,
        signal: result.signal ?? undefined,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        timedOut: timeoutTriggered,
    };
};
export const execRunTool = (ctx) => {
    const config = loadApprovedExecConfig(ctx.env);
    const commandById = new Map(config.commands.map((cmd) => [cmd.id, cmd]));
    const spec = {
        name: 'exec_run',
        description: 'Execute a vetted shell command from the allowlist. Supports optional args when explicitly enabled.',
        inputSchema: {
            commandId: ExecInputSchema.shape.commandId,
            args: ExecInputSchema.shape.args,
            timeoutMs: ExecInputSchema.shape.timeoutMs,
        },
        examples: [
            {
                comment: 'Run the allowlisted git status command',
                args: { commandId: 'git.status' },
            },
            {
                comment: 'Pass extra args to an allowlisted script',
                args: { commandId: 'npm.test', args: ['--watch'] },
            },
        ],
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = (raw) => {
        const parsed = ExecInputSchema.parse(raw);
        const command = commandById.get(parsed.commandId);
        if (!command) {
            throw new Error(`Unknown approved command id: ${parsed.commandId}`);
        }
        const { timeoutMs, forceKillDelayMs } = computeTimeouts(command, {
            timeoutMs: config.defaultTimeoutMs,
            forceKillDelayMs: config.forceKillDelayMs,
        }, parsed.timeoutMs);
        return runApprovedCommand(command, parsed.args, {
            env: ctx.env,
            defaultCwd: config.defaultCwd,
            rootFromEnv: ctx.env.MCP_ROOT_PATH,
            timeoutMs,
            forceKillDelayMs,
        });
    };
    return { spec, invoke };
};
export const execListTool = (ctx) => {
    const config = loadApprovedExecConfig(ctx.env);
    const spec = {
        name: 'exec_list',
        description: 'List approved shell commands and their metadata.',
        stability: 'stable',
        since: '0.1.0',
    };
    const invoke = () => Promise.resolve(config.commands.map((command) => ({
        id: command.id,
        command: command.command,
        args: command.args ?? [],
        description: command.description,
        allowExtraArgs: command.allowExtraArgs ?? false,
        cwd: command.cwd ?? config.defaultCwd ?? ctx.env.MCP_ROOT_PATH ?? process.cwd(),
        timeoutMs: command.timeoutMs ?? config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS,
    })));
    return { spec, invoke };
};
//# sourceMappingURL=exec.js.map