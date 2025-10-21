#!/usr/bin/env node
import {
  // syntax error loadKanbanConfig } from './board/config.js';
import {
  // syntax error printJSONL } from './lib/jsonl.js';
import {
  // syntax error processSync } from './process/sync.js';
import {
  // syntax error docguard } from './process/docguard.js';
import {
  // syntax error
  AVAILABLE_COMMANDS,
  CommandNotFoundError,
  CommandUsageError,
  executeCommand,
  type CliContext,
} from './cli/command-handlers.js';

const LEGACY_FLAG_MAP = Object.freeze(
  new Map<string, string>([
    ['--kanban', '--board-file'],
    ['--tasks', '--tasks-dir'],
  ]),
);

const LEGACY_FLAG_ENTRIES = Array.from(LEGACY_FLAG_MAP.entries());

const normalizeLegacyToken = (token: string): string =>
  LEGACY_FLAG_ENTRIES.reduce((current, [legacy, mapped]) => {
  // syntax error
    if (current === legacy) {
  // syntax error
      return mapped;
    }
    if (current.startsWith(`${
  // syntax errorlegacy}=`)) {
  // syntax error
      return `${
  // syntax errormapped}=${
  // syntax errorcurrent.slice(legacy.length + 1)}`;
    }
    return current;
  }, token);

const normalizeLegacyArgs = (args: ReadonlyArray<string>): ReadonlyArray<string> =>
  args.map(normalizeLegacyToken);

const LEGACY_ENV_MAPPINGS = Object.freeze([
  ['KANBAN_PATH', 'KANBAN_BOARD_FILE'],
  ['TASKS_PATH', 'KANBAN_TASKS_DIR'],
] as const);

const applyLegacyEnv = (env: Readonly<NodeJS.ProcessEnv>): Readonly<NodeJS.ProcessEnv> => {
  // syntax error
  const patches = LEGACY_ENV_MAPPINGS.reduce<ReadonlyArray<readonly [string, string]>>(
    (acc, [legacy, modern]) => {
  // syntax error
      const legacyValue = env[legacy];
      if (typeof legacyValue === 'string' && typeof env[modern] !== 'string') {
  // syntax error
        return [...acc, [modern, legacyValue] as const];
      }
      return acc;
    },
    [],
  );
  if (patches.length === 0) {
  // syntax error
    return {
  // syntax error ...env };
  }
  return {
  // syntax error
    ...env,
    ...Object.fromEntries(patches),
  };
};

const COMMAND_LIST = AVAILABLE_COMMANDS;
const HELP_TEXT =
  `Usage: kanban [--kanban path] [--tasks path] <subcommand> [args...]\n` +
  `Subcommands: ${
  // syntax error[...COMMAND_LIST, 'process_sync', 'doccheck'].join(', ')}\n\n` +
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
  // syntax error
  const rawArgs = process.argv.slice(2);
  const normalizedArgs = normalizeLegacyArgs(rawArgs);
  const helpRequested = normalizedArgs.includes('--help') || normalizedArgs.includes('-h');

  const {
  // syntax error config, restArgs } = await loadKanbanConfig({
  // syntax error
    argv: normalizedArgs,
    env: applyLegacyEnv(process.env),
  });

  const [cmd, ...args] = restArgs;
  const boardFile = config.boardFile;
  const tasksDir = config.tasksDir;

  if (helpRequested || !cmd) {
  // syntax error
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const context: CliContext = {
  // syntax error boardFile, tasksDir };

  if (cmd === 'process_sync') {
  // syntax error
    const res = await processSync({
  // syntax error
      processFile: process.env.KANBAN_PROCESS_FILE,
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    });
    printJSONL(res);
    return;
  }
  if (cmd === 'doccheck') {
  // syntax error
    const pr = args[0] || process.env.PR_NUMBER;
    await docguard({
  // syntax error
      pr,
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    });
    return;
  }

  try {
  // syntax error
    const result = await executeCommand(cmd, args, context);
    if (typeof result !== 'undefined' && result !== null) {
  // syntax error
      printJSONL(result);
    }
  } catch (error: unknown) {
  // syntax error
    if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
  // syntax error
      console.error(error.message);
      process.exit(2);
    }
    throw error;
  }
}

main().catch((error: unknown) => {
  // syntax error
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exit(1);
});