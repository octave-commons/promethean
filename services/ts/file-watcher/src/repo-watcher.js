import chokidar from 'chokidar';
import { execFile } from 'child_process';
function defaultIgnored(pathRel) {
    // Quick coarse filter to reduce event volume; gitignore check will refine
    return (pathRel.includes('/.git/') ||
        pathRel.startsWith('.git/') ||
        pathRel.includes('/node_modules/') ||
        pathRel.startsWith('node_modules/') ||
        pathRel.includes('/dist/') ||
        pathRel.startsWith('dist/') ||
        pathRel.includes('/build/') ||
        pathRel.startsWith('build/') ||
        pathRel.includes('/.obsidian/') ||
        pathRel.startsWith('.obsidian/') ||
        pathRel.startsWith('.'));
}
export function checkGitIgnored(repoRoot, pathRel) {
    return new Promise((resolve) => {
        let resolved = false;
        try {
            const child = execFile('git', ['check-ignore', '-q', '--no-index', '--stdin'], {
                cwd: repoRoot,
            });
            child.on('error', () => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            });
            child.on('close', (code) => {
                if (!resolved) {
                    resolved = true;
                    resolve(code === 0);
                }
            });
            child.stdin?.write(pathRel + '\n');
            child.stdin?.end();
        }
        catch {
            resolve(false);
        }
    });
}
async function resolveToken(tp) {
    if (!tp)
        return undefined;
    if (typeof tp === 'string')
        return tp;
    try {
        return await tp();
    }
    catch {
        return undefined;
    }
}
async function postJSON(url, body, token) {
    try {
        const t = await resolveToken(token);
        await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
            },
            body: JSON.stringify(body),
        });
    }
    catch {
        // ignore transient errors; watcher will send again on next change
    }
}
export async function createRepoWatcher({ repoRoot, bridgeUrl, debounceMs, authToken, }) {
    const DEBOUNCE_MS = typeof debounceMs === 'number'
        ? debounceMs
        : Number(process.env.FILE_WATCHER_DEBOUNCE_MS || 2000);
    // Prefer dynamic token provider via auth-service if configured; fallback to static env token
    let TOKEN = undefined;
    const { createTokenProviderFromEnv } = await import('./token-client.js');
    const provider = createTokenProviderFromEnv();
    if (provider) {
        TOKEN = provider;
    }
    else {
        TOKEN =
            authToken ||
                process.env.SMARTGPT_BRIDGE_TOKEN ||
                process.env.BRIDGE_AUTH_TOKEN ||
                process.env.AUTH_TOKEN ||
                '';
    }
    const watcher = chokidar.watch('**/*', {
        cwd: repoRoot,
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
        ignored: (p) => defaultIgnored(p.replace(/\\/g, '/')),
    });
    // Debounce state per path
    const pending = new Map();
    function schedule(rel, action) {
        const cur = pending.get(rel);
        const nextAction = cur
            ? cur.action === 'remove' || action === 'remove'
                ? 'remove'
                : 'index'
            : action;
        if (cur) {
            clearTimeout(cur.timer);
        }
        const timer = setTimeout(async () => {
            pending.delete(rel);
            if (nextAction === 'remove') {
                await postJSON(`${bridgeUrl}/indexer/remove`, { path: rel }, TOKEN);
            }
            else {
                await postJSON(`${bridgeUrl}/indexer/index`, { path: rel }, TOKEN);
            }
        }, DEBOUNCE_MS);
        pending.set(rel, { action: nextAction, timer });
    }
    async function handle(event, rawPath) {
        console.log({ event, rawPath });
        const rel = rawPath.replace(/\\/g, '/');
        if (defaultIgnored(rel))
            return;
        if (await checkGitIgnored(repoRoot, rel))
            return;
        schedule(rel, event === 'unlink' ? 'remove' : 'index');
    }
    watcher.on('add', (p) => handle('add', p));
    watcher.on('change', (p) => handle('change', p));
    watcher.on('unlink', (p) => handle('unlink', p));
    return {
        close: async () => {
            await watcher.close();
            // Flush pending timers immediately
            for (const [rel, entry] of pending.entries()) {
                clearTimeout(entry.timer);
                // fire-and-forget flush based on action
                if (entry.action === 'remove') {
                    postJSON(`${bridgeUrl}/indexer/remove`, { path: rel }, TOKEN);
                }
                else {
                    postJSON(`${bridgeUrl}/indexer/index`, { path: rel }, TOKEN);
                }
            }
            pending.clear();
        },
        // exposed for tests
        _handle: handle,
    };
}
//# sourceMappingURL=repo-watcher.js.map