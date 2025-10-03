// GPL-3.0-only
import { type ChildProcess } from 'node:child_process';

import type { ExecutionContext } from 'ava';
import type ava from 'ava';

import { startProcess } from './startProcess.js';

export type Ready =
    | { kind: 'http'; url: string; timeoutMs?: number }
    | { kind: 'tcp'; host?: string; port: number; timeoutMs?: number }
    | { kind: 'log'; pattern: RegExp; timeoutMs?: number };

export type ProcSpec = {
    cmd: string; // e.g. 'node'
    args?: readonly string[]; // e.g. ['dist/dev-ui.js', '--port', '3939']
    cwd: string | undefined; // package root for that service
    env?: NodeJS.ProcessEnv; // default process.env
    stdio?: 'inherit' | 'pipe'; // 'inherit' is simplest
    ready?: Ready; // pick one readiness strategy
};

export type StartedProc = {
    proc: ChildProcess;
    stop: () => Promise<void>;
};

export type PortInjection = { mode: 'fixed'; port: number } | { mode: 'free' }; // find one

export type WithPort = ProcSpec & {
    port?: PortInjection;
    baseUrlTemplate?: (port: number) => string; // e.g., p => `http://127.0.0.1:${p}/`
};

export type FileProc = { pid: number; baseUrl: string | undefined };

type ProcDeps = {
    procPid: number;
    stop: () => Promise<void>;
};

export type IntegrationTestFn = (t: ExecutionContext, deps: ProcDeps) => Promise<void>;

// packages/test-harness/src/register-proc-for-file.ts

export const registerProcForFile = (
    test: typeof ava,
    spec: ProcSpec & { baseUrl?: string },
): { getProc: () => FileProc } => {
    const state: { current: StartedProc | null } = { current: null };
    const baseUrl = spec.baseUrl;

    test.before(async () => {
        state.current = await startProcess(spec);
    });
    test.after.always(async () => {
        await state.current?.stop?.();
        state.current = null;
    });

    const getProc = (): FileProc => {
        const started = state.current;
        if (!started) throw new Error('process not started (did you import registerProcForFile in this file?)');
        return { pid: started.proc.pid ?? -1, baseUrl };
    };

    return { getProc };
};
// GPL-3.0-only

export const registerProcForFileWithPort = (
    test: typeof ava,
    spec: ProcSpec & {
        port?: { mode: 'fixed'; port: number } | { mode: 'free' };
        baseUrlTemplate?: (port: number) => string;
    },
): { getProc: () => FileProc } => {
    const state: {
        current: { stop: () => Promise<void>; pid: number; baseUrl?: string | undefined } | null;
    } = { current: null };

    test.before(async () => {
        const { stop, proc, baseUrl } = await startProcessWithPort(spec);
        state.current = { stop, pid: proc.pid ?? -1, baseUrl };
    });

    test.after.always(async () => {
        const current = state.current;
        state.current = null;
        await current?.stop?.();
    });

    const getProc = (): FileProc => {
        const current = state.current;
        if (!current) throw new Error('process not started in this file');
        return { pid: current.pid, baseUrl: current.baseUrl };
    };

    return { getProc };
};

export const startProcessWithPort = async (
    spec: WithPort,
): Promise<StartedProc & { port: number | undefined; baseUrl: string | undefined }> => {
    const { port: p, baseUrlTemplate, ...rest } = spec;

    const port = await (async (): Promise<number | undefined> => {
        if (p?.mode === 'fixed') return p.port;
        if (p?.mode === 'free') return (await import('./port-pool.js')).getFreePort();
        return undefined;
    })();

    const args =
        port !== undefined ? (rest.args ?? []).map((a) => (a === ':PORT' ? String(port) : a)) : rest.args ?? [];

    const ready = (() => {
        const r = rest.ready;
        if (!r) return r;
        if (r.kind === 'http' && typeof r.url === 'string' && port !== undefined) {
            return { ...r, url: r.url.replace('PORT', String(port)) } as typeof r;
        }
        if (r.kind === 'tcp' && port !== undefined) {
            return { ...r, port } as typeof r;
        }
        return r;
    })();

    const proc = await startProcess({
        ...rest,
        args,
        ...(ready ? { ready } : {}),
    });

    const baseUrl = port !== undefined && baseUrlTemplate ? baseUrlTemplate(port) : undefined;
    return { ...proc, port, baseUrl };
};
