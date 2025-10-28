import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';
import { getMcpRoot } from '../files.js';
const execFileAsync = promisify(execFile);
const MAX_BUFFER = 16 * 1024 * 1024;
const DEFAULT_TIMEOUT = 10 * 60 * 1000;
const NON_WHITESPACE = /\S/;
const PRESETS = ['ts-lib', 'base', 'web-frontend', 'fastify-service'];
const DEFAULT_PRESET = 'ts-lib';
const GENERATOR_ID = 'tools:package';
const PRESET_ALIASES = new Map([
    ['ts-lib', 'ts-lib'],
    ['tslib', 'ts-lib'],
    ['library', 'ts-lib'],
    ['lib', 'ts-lib'],
    ['base', 'base'],
    ['frontend', 'web-frontend'],
    ['web-frontend', 'web-frontend'],
    ['web', 'web-frontend'],
    ['ui', 'web-frontend'],
    ['fastify', 'fastify-service'],
    ['fastify-service', 'fastify-service'],
    ['service', 'fastify-service'],
]);
const isDefinedString = (entry) => typeof entry[1] === 'string';
const sanitizeEnv = (env) => Object.fromEntries(Object.entries({ ...process.env, ...env }).filter(isDefinedString));
const isExecError = (value) => Boolean(value && typeof value === 'object' && 'stdout' in value && 'stderr' in value);
const toSuccessResult = (command, args, cwd) => ({
    command,
    args,
    cwd,
    exitCode: 0,
});
const mergeSuccess = (base, io) => ({
    ...base,
    stdout: io.stdout,
    stderr: io.stderr,
});
const toErrorResult = (command, args, cwd, error) => {
    const exitCode = typeof error.code === 'number' ? error.code : null;
    return {
        command,
        args,
        cwd,
        exitCode,
        signal: error.signal ?? null,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? '',
        error: exitCode && exitCode !== 0 ? error.message : undefined,
    };
};
const runNxCommand = (ctx, args) => {
    const bin = ctx.env.PNPM_BIN ?? 'pnpm';
    const cwd = getMcpRoot();
    const env = sanitizeEnv(ctx.env);
    const base = toSuccessResult(bin, args, cwd);
    const handleError = (error) => {
        if (!isExecError(error)) {
            return Promise.reject(error);
        }
        if (!(typeof error.code === 'number' || error.code === null)) {
            return Promise.reject(error);
        }
        return toErrorResult(bin, args, cwd, error);
    };
    return execFileAsync(bin, args, {
        cwd,
        env: { ...env },
        encoding: 'utf8',
        maxBuffer: MAX_BUFFER,
        timeout: DEFAULT_TIMEOUT,
    })
        .then((io) => mergeSuccess(base, io))
        .catch(handleError);
};
const normalizePresetKey = (value) => value.trim().toLowerCase();
export const resolvePreset = (input) => {
    if (!input) {
        return DEFAULT_PRESET;
    }
    const preset = PRESET_ALIASES.get(normalizePresetKey(input));
    if (!preset) {
        const allowed = Array.from(new Set([DEFAULT_PRESET, ...PRESET_ALIASES.values()]));
        throw new Error(`Unknown preset "${input}". Expected one of: ${Array.from(allowed).join(', ')}.`);
    }
    return preset;
};
export const buildNxGenerateArgs = (options) => {
    const baseArgs = [
        'exec',
        'nx',
        'generate',
        GENERATOR_ID,
        '--name',
        options.name,
        '--preset',
        options.preset,
        '--no-interactive',
    ];
    if (!options.dryRun) {
        return baseArgs;
    }
    return [...baseArgs, '--dry-run'];
};
const createTool = (_ctx, executor) => {
    const shape = {
        name: z.string().min(1).regex(NON_WHITESPACE),
        preset: z.string().min(1).regex(NON_WHITESPACE).optional(),
        dryRun: z.boolean().default(false),
    };
    const Schema = z.object(shape);
    const spec = {
        name: 'nx_generate_package',
        description: 'Generate a new workspace package using the Nx tools:package generator.',
        inputSchema: Schema.shape,
        stability: 'experimental',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const parsed = Schema.parse(raw);
        const name = parsed.name.trim();
        const preset = resolvePreset(parsed.preset);
        const dryRun = parsed.dryRun ?? false;
        const args = buildNxGenerateArgs({ name, preset, dryRun });
        return executor(args);
    };
    return { spec, invoke };
};
export const nxGeneratePackage = (ctx) => createTool(ctx, (args) => runNxCommand(ctx, args));
export const __test__ = {
    createTool,
    resolvePreset,
    buildNxGenerateArgs,
    runNxCommand,
};
//# sourceMappingURL=nx.js.map