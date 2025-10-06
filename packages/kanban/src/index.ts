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

const LEGACY_FLAG_MAP = Object.freeze(
  new Map<string, string>([
    ['--kanban', '--board-file'],
    ['--tasks', '--tasks-dir'],
  ]),
);

const LEGACY_FLAG_ENTRIES = Array.from(LEGACY_FLAG_MAP.entries());

const normalizeLegacyToken = (token: string): string =>
  LEGACY_FLAG_ENTRIES.reduce((current, [legacy, mapped]) => {
    if (current === legacy) {
      return mapped;
    }
    if (current.startsWith(`${legacy}=`)) {
      return `${mapped}=${current.slice(legacy.length + 1)}`;
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
  const patches = LEGACY_ENV_MAPPINGS.reduce<ReadonlyArray<readonly [string, string]>>(
    (acc, [legacy, modern]) => {
      const legacyValue = env[legacy];
      if (typeof legacyValue === 'string' && typeof env[modern] !== 'string') {
        return [...acc, [modern, legacyValue] as const];
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

const COMMAND_LIST = AVAILABLE_COMMANDS;
const HELP_TEXT =
  `Usage: kanban [--kanban path] [--tasks path] <subcommand> [args...]\n` +
  `Subcommands: ${[...COMMAND_LIST, 'process_sync', 'doccheck'].join(', ')}`;
async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const normalizedArgs = normalizeLegacyArgs(rawArgs);
  const helpRequested = normalizedArgs.includes('--help') || normalizedArgs.includes('-h');

  const { config, restArgs } = await loadKanbanConfig({
    argv: normalizedArgs,
    env: applyLegacyEnv(process.env),
  });

  const [cmd, ...args] = restArgs;
  const boardFile = config.boardFile;
  const tasksDir = config.tasksDir;

  if (helpRequested || !cmd) {
    console.error(HELP_TEXT);
    process.exit(2);
  }

  const context: CliContext = { boardFile, tasksDir };

  if (cmd === 'process_sync') {
    const res = await processSync({
      processFile: process.env.KANBAN_PROCESS_FILE,
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
    });
    printJSONL(res);
    return;
  }
  if (cmd === 'doccheck') {
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
    const result = await executeCommand(cmd, args, context);
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
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
