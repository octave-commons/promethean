import chokidar from 'chokidar';
import pc from 'picocolors';
import { addAll, commit, gitRoot, hasRepo, hasStagedChanges, listChangedFiles, repoSummary, stagedDiff, } from './git.js';
import { chatCompletion } from './llm.js';
import { SYSTEM, USER } from './messages.js';
/**
 * Error types for better error handling
 */
class AutocommitError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.name = 'AutocommitError';
        this.cause = cause;
    }
}
function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        throw new AutocommitError('Invalid configuration provided');
    }
}
function getIgnoredPaths(config) {
    return [
        '**/.git/**',
        '**/node_modules/**',
        '**/.turbo/**',
        '**/dist/**',
        ...(config.exclude
            ? config.exclude
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : []),
    ];
}
function createLogger() {
    const log = (s) => console.log(pc.dim(`[autocommit] ${s}`));
    const warn = (s) => console.warn(pc.yellow(`[autocommit] ${s}`));
    return { log, warn };
}
function categorizeError(err) {
    if (err instanceof Error && err.name === 'AbortError') {
        return 'LLM request timed out. Falling back.';
    }
    if (err instanceof Error &&
        err.status &&
        err.status >= 500) {
        return 'LLM server error. Falling back.';
    }
    const errorMessage = err instanceof Error ? err.message : String(err);
    return `LLM failed: ${errorMessage}. Falling back.`;
}
function generateFallbackMessage(files) {
    const type = files.some((f) => f.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)) ? 'feat' : 'chore';
    return `${type}: update ${files.length} file(s) [auto]\n\n- ${files.slice(0, 10).join('\n- ')}${files.length > 10 ? '\n- …' : ''}`;
}
async function generateCommitMessage(config, context, warn) {
    try {
        const message = await chatCompletion({
            baseUrl: config.baseUrl,
            apiKey: config.apiKey,
            model: config.model,
            temperature: config.temperature,
            messages: [
                { role: 'system', content: SYSTEM },
                {
                    role: 'user',
                    content: USER(context.summary, context.files.slice(0, 100).join(', '), context.diff),
                },
            ],
        });
        return message.replace(/\r\n/g, '\n').trim();
    }
    catch (err) {
        warn(categorizeError(err));
        return generateFallbackMessage(context.files);
    }
}
async function performCommit(config, root, log, warn) {
    await addAll(root);
    if (!(await hasStagedChanges(root))) {
        return;
    }
    const files = await listChangedFiles(root);
    const summary = await repoSummary(root);
    const diff = await stagedDiff(root, config.maxDiffBytes);
    const message = await generateCommitMessage(config, { files, summary, diff }, warn);
    if (config.dryRun) {
        log(pc.cyan(`DRY RUN commit:\n${message}`));
        return;
    }
    await commit(root, message, config.signoff);
    log(pc.green(`Committed ${files.length} file(s).`));
}
function setupWatcher(root, ignored, callbacks) {
    const watcher = chokidar.watch(root, {
        ignoreInitial: true,
        ignored,
        persistent: true,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
        usePolling: false, // Use native events for better performance
    });
    // Add error handling for watcher
    watcher.on('error', (error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callbacks.warn(`Watcher error: ${errorMessage}`);
    });
    watcher.on('all', (_event, _path) => {
        void callbacks.schedule().catch((err) => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            callbacks.warn(`Schedule error: ${errorMessage}`);
        });
    });
    callbacks.log(`Watching ${root}. Ignored: ${ignored.join(', ')}`);
    return {
        close: () => {
            void watcher.close();
        },
    };
}
function createScheduler(config, root, log, warn) {
    let timer = null;
    const cleanup = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };
    const schedule = () => {
        cleanup();
        return new Promise((resolve) => {
            timer = setTimeout(() => {
                void (async () => {
                    timer = null;
                    try {
                        await performCommit(config, root, log, warn);
                    }
                    catch (e) {
                        const errorMessage = e instanceof Error ? e.message : String(e);
                        warn(`Commit cycle error: ${errorMessage}`);
                    }
                    resolve();
                })();
            }, config.debounceMs);
        });
    };
    return { schedule, cleanup };
}
/**
 * Starts autocommit watcher for a git repository.
 * @param config - Configuration object containing autocommit settings
 * @returns Object containing cleanup function
 * @throws AutocommitError if the specified path is not a git repository
 */
export async function start(config) {
    validateConfig(config);
    const cwd = config.path;
    if (!(await hasRepo(cwd))) {
        throw new AutocommitError(`Not a git repo: ${cwd}`);
    }
    const root = await gitRoot(cwd);
    const { log, warn } = createLogger();
    const ignored = getIgnoredPaths(config);
    const { schedule, cleanup } = createScheduler(config, root, log, warn);
    const watcherSetup = setupWatcher(root, ignored, { schedule, log, warn });
    log(`Watching ${root} (debounce ${config.debounceMs}ms). Ignored: ${ignored.join(', ')}`);
    return {
        close: () => {
            cleanup();
            watcherSetup.close();
        },
    };
}
//# sourceMappingURL=index.js.map