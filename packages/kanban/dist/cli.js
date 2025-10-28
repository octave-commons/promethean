#!/usr/bin/env node
import { loadKanbanConfig } from './board/config.js';
import { printJSONL } from './lib/jsonl.js';
import { printMarkdown } from './lib/markdown-output.js';
import { processSync } from './process/sync.js';
import { docguard } from './process/docguard.js';
import { AVAILABLE_COMMANDS, CommandNotFoundError, CommandUsageError, executeCommand, } from './cli/command-handlers.js';
const LEGACY_FLAG_MAP = Object.freeze(new Map([
    ['--kanban', '--board-file'],
    ['--tasks', '--tasks-dir'],
]));
const LEGACY_FLAG_ENTRIES = Array.from(LEGACY_FLAG_MAP.entries());
const normalizeLegacyToken = (token) => LEGACY_FLAG_ENTRIES.reduce((current, [legacy, mapped]) => {
    if (current === legacy) {
        return mapped;
    }
    if (current.startsWith(`${legacy}=`)) {
        return `${mapped}=${current.slice(legacy.length + 1)}`;
    }
    return current;
}, token);
const normalizeLegacyArgs = (args) => args.map(normalizeLegacyToken);
const LEGACY_ENV_MAPPINGS = Object.freeze([
    ['KANBAN_PATH', 'KANBAN_BOARD_FILE'],
    ['TASKS_PATH', 'KANBAN_TASKS_DIR'],
]);
const applyLegacyEnv = (env) => {
    const patches = LEGACY_ENV_MAPPINGS.reduce((acc, [legacy, modern]) => {
        const legacyValue = env[legacy];
        if (typeof legacyValue === 'string' && typeof env[modern] !== 'string') {
            return [...acc, [modern, legacyValue]];
        }
        return acc;
    }, []);
    if (patches.length === 0) {
        return { ...env };
    }
    return {
        ...env,
        ...Object.fromEntries(patches),
    };
};
const COMMAND_LIST = AVAILABLE_COMMANDS;
/**
 * Detect the type of output based on command
 */
const detectOutputType = (cmd) => {
    switch (cmd) {
        case 'find':
            return 'task';
        case 'list':
        case 'pull':
        case 'push':
        case 'sync':
            return 'tasks';
        case 'regenerate':
        case 'ui':
            return 'board';
        case 'search':
            return 'search';
        case 'count':
            return 'count';
        case 'audit':
            return 'audit';
        default:
            return 'table';
    }
};
const HELP_TEXT = `Usage: kanban [--kanban path] [--tasks path] [--json] <subcommand> [args...]\n` +
    `Subcommands: ${[...COMMAND_LIST, 'process_sync', 'doccheck'].join(', ')}\n\n` +
    `Options:\n` +
    `  --json   - Output in JSONL format (default: markdown)\n\n` +
    `Setup:\n` +
    `  init     - Initialize a new kanban project with simple config\n\n` +
    `Core Operations:\n` +
    `  push     - Push board state to task files (board → files)\n` +
    `  pull     - Pull task file state to board (files → board)\n` +
    `  sync     - Bidirectional sync with conflict detection\n` +
    `  regenerate - Regenerate board from task files\n\n` +
    `Task Management:\n` +
    `  create   - Create new task\n` +
    `  update   - Update existing task\n` +
    `  delete   - Delete task\n` +
    `  list     - List tasks with status\n\n` +
    `Search & Navigation:\n` +
    `  find     - Find task by UUID\n` +
    `  search   - Search tasks by content\n` +
    `  count    - Count tasks in columns\n\n` +
    `Advanced:\n` +
    `  audit    - Audit board consistency\n` +
    `  heal     - Heal board issues with git tag management\n` +
    `  ui       - Start web UI\n` +
    `  dev      - Start development server\n\n` +
    `WIP Management:\n` +
    `  enforce-wip-limits - Enforce WIP limits and move excess tasks\n` +
    `  wip-monitor       - Real-time capacity monitoring\n` +
    `  wip-compliance    - Generate compliance reports\n` +
    `  wip-violations    - View violation history\n` +
    `  wip-suggestions  - Get capacity balancing suggestions`;
async function main() {
    const rawArgs = process.argv.slice(2);
    const normalizedArgs = normalizeLegacyArgs(rawArgs);
    const helpRequested = normalizedArgs.includes('--help') || normalizedArgs.includes('-h');
    const jsonRequested = normalizedArgs.includes('--json');
    // Special handling for init command - extract config path before config loading
    const [cmd, ...restArgs] = normalizedArgs;
    if (cmd === 'init') {
        const context = {
            boardFile: '',
            tasksDir: '',
            argv: normalizedArgs,
        };
        try {
            const result = await executeCommand(cmd, restArgs, context);
            if (typeof result !== 'undefined' && result !== null) {
                if (jsonRequested) {
                    printJSONL(result);
                }
                else {
                    printMarkdown(result, detectOutputType(cmd), { query: restArgs[0] || '' });
                }
            }
        }
        catch (error) {
            if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
                console.error(error.message);
                process.exit(2);
            }
            throw error;
        }
        return;
    }
    const { config, restArgs: configRestArgs } = await loadKanbanConfig({
        argv: normalizedArgs,
        env: applyLegacyEnv(process.env),
    });
    // Filter out --json flag from command arguments
    const filteredArgs = configRestArgs.filter((arg) => arg !== '--json');
    const [actualCmd, ...args] = filteredArgs;
    const boardFile = config.boardFile;
    const tasksDir = config.tasksDir;
    if (helpRequested || !actualCmd) {
        console.log(HELP_TEXT);
        process.exit(0);
    }
    const context = { boardFile, tasksDir, argv: normalizedArgs };
    if (actualCmd === 'process_sync') {
        const res = await processSync({
            processFile: process.env.KANBAN_PROCESS_FILE,
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            token: process.env.GITHUB_TOKEN,
        });
        printJSONL(res);
        return;
    }
    if (actualCmd === 'doccheck') {
        const pr = args[0] || process.env.PR_NUMBER;
        await docguard({
            pr,
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            token: process.env.GITHUB_TOKEN,
        });
        return;
    }
    try {
        const result = await executeCommand(actualCmd, args, context);
        if (typeof result !== 'undefined' && result !== null) {
            if (jsonRequested) {
                printJSONL(result);
            }
            else {
                printMarkdown(result, detectOutputType(actualCmd), { query: args[0] });
            }
        }
    }
    catch (error) {
        if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
            console.error(error.message);
            process.exit(2);
        }
        throw error;
    }
}
main().catch((error) => {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    console.error(message);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map