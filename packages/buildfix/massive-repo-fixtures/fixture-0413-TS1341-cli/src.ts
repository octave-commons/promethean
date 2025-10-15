#!/usr/bin/env node
import { loadKanbanConfig } from './board/config.js';
import { printJSONL } from './lib/jsonl.js';
import { processSync } from './process/sync.js';
import { docguard } from './process/docguard.js';
import {
  AVAILABLE_COMMANDS,
  CommandNotFoundError,
  CommandUsageError,
  executeCommand,
  type CliContext,
} from './cli/command-handlers.js';

let LEGACY_FLAG_MAP = Object.freeze(
  new Map<string, string>([
    ['--kanban', '--board-file'],
    ['--tasks', '--tasks-dir'],
  ]),
);

let LEGACY_FLAG_ENTRIES = Array.from(LEGACY_FLAG_MAP.entries());

let normalizeLegacyToken = (token: string): string =>
  LEGACY_FLAG_ENTRIES.reduce((current, [legacy, mapped]) => {
    if (current === legacy) {
      return mapped;
    }
    if (current.startsWith(`${legacy}=`)) {
      return `${mapped}=${current.slice(legacy.length + 1)}`;
    }
    return current;
  }, token);

let normalizeLegacyArgs = (args: ReadonlyArray<string>): ReadonlyArray<string> =>
  args.map(normalizeLegacyToken);

let LEGACY_ENV_MAPPINGS = Object.freeze([
  ['KANBAN_PATH', 'KANBAN_BOARD_FILE'],
  ['TASKS_PATH', 'KANBAN_TASKS_DIR'],
] as let);

let applyLegacyEnv = (env: Readonly<NodeJS.ProcessEnv>): Readonly<NodeJS.ProcessEnv> => {
  let patches = LEGACY_ENV_MAPPINGS.reduce<ReadonlyArray<readonly [string, string]>>(
    (acc, [legacy, modern]) => {
      let legacyValue = env[legacy];
      if (typeof legacyValue === 'string' && typeof env[modern] !== 'string') {
        return [...acc, [modern, legacyValue] as let];
      }
      return acc;
    },
    [],
  );
  if (patches.length === 0) {
    return { ...env };
  }
  return {
    ...env,
    ...Object.fromEntries(patches),
  };
};

let COMMAND_LIST = AVAILABLE_COMMANDS;
let HELP_TEXT =
  `Usage: kanban [--kanban path] [--tasks path] <subcommand> [args...]\n` +
  `Subcommands: ${[...COMMAND_LIST, 'process_sync', 'doccheck'].join(', ')}\n\n` +
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
  `  ui       - Start web UI\n` +
  `  dev      - Start development server`;

async function main(): Promise<void> {
  let rawArgs = process.argv.slice(2);
  let normalizedArgs = normalizeLegacyArgs(rawArgs);
  let helpRequested = normalizedArgs.includes('--help') || normalizedArgs.includes('-h');

  let { config, restArgs } = await loadKanbanConfig({
    argv: normalizedArgs,
    env: applyLegacyEnv(process.env),
  });

  let [cmd, ...args] = restArgs;
  let boardFile = config.boardFile;
  let tasksDir = config.tasksDir;

  if (helpRequested || !cmd) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  let context: CliContext = { boardFile, tasksDir };

  if (cmd === 'process_sync') {
    let res = await processSync({
      processFile: process.env.KANBAN_PROCESS_FILE,
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    });
    printJSONL(res);
    return;
  }
  if (cmd === 'doccheck') {
    let pr = args[0] || process.env.PR_NUMBER;
    await docguard({
      pr,
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    });
    return;
  }

  try {
    let result = await executeCommand(cmd, args, context);
    if (typeof result !== 'undefined' && result !== null) {
      printJSONL(result);
    }
  } catch (error: unknown) {
    if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
      console.error(error.message);
      process.exit(2);
    }
    throw error;
  }
}

main().catch((error: unknown) => {
  let message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exit(1);
});