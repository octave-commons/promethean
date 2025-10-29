#!/usr/bin/env node
import { Command } from 'commander';
import { loadKanbanConfig } from './board/config.js';
import { printJSONL } from './lib/jsonl.js';
import { printMarkdown } from './lib/markdown-output.js';
import { processSync } from './process/sync.js';
import { docguard } from './process/docguard.js';
import {
  CommandNotFoundError,
  CommandUsageError,
  executeCommand,
  type CliContext,
} from './cli/command-handlers.js';
import { setLogLevel } from './lib/utils/logger.js';

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

/**
 * Detect the type of output based on command
 */
const detectOutputType = (
  cmd: string,
): 'task' | 'tasks' | 'board' | 'search' | 'count' | 'audit' | 'table' => {
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

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('kanban')
    .description('Automation for local markdown kanban and process-as-code')
    .version('0.2.0');

  // Global options
  program
    .option('--kanban <path>', 'Path to kanban board file (legacy: --board-file)')
    .option('--tasks <path>', 'Path to tasks directory (legacy: --tasks-dir)')
    .option('--json', 'Output in JSONL format (default: markdown)')
    .option(
      '--log-level <level>',
      'Set log level: silent, error, warn, info, debug (default: info)',
      'info',
    );

  // Parse arguments to get command and options
  program.parse();
  const options = program.opts();
  const [cmd, ...args] = program.args;

  // Set log level with validation
  if (options.logLevel) {
    const validLevels: readonly string[] = ['silent', 'error', 'warn', 'info', 'debug'];
    if (validLevels.includes(options.logLevel)) {
      setLogLevel(options.logLevel as 'silent' | 'error' | 'warn' | 'info' | 'debug');
    } else {
      console.error(
        `Invalid log level: ${options.logLevel}. Valid levels are: ${validLevels.join(', ')}`,
      );
      process.exit(2);
    }
  }

  // Handle init command specially
  if (cmd === 'init') {
    const context: CliContext = {
      boardFile: options.kanban || '',
      tasksDir: options.tasks || '',
      argv: process.argv.slice(2),
    };

    try {
      const result = await executeCommand(cmd || '', args, context);
      if (typeof result !== 'undefined' && result !== null) {
        if (options.json) {
          printJSONL(result);
        } else {
          printMarkdown(result, detectOutputType(cmd), { query: args[0] || '' });
        }
      }
    } catch (error: unknown) {
      if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
        console.error(error.message);
        process.exit(2);
      }
      throw error;
    }
    return;
  }

  // Load config for other commands
  const { config } = await loadKanbanConfig({
    argv: process.argv.slice(2),
    env: applyLegacyEnv(process.env),
  });

  const boardFile = options.kanban || config.boardFile;
  const tasksDir = options.tasks || config.tasksDir;

  const context: CliContext = { boardFile, tasksDir, argv: process.argv.slice(2) };

  // Handle special commands
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

  // Execute regular command
  try {
    const result = await executeCommand(cmd || '', args, context);
    if (typeof result !== 'undefined' && result !== null) {
      if (options.json) {
        printJSONL(result);
      } else {
        printMarkdown(result, detectOutputType(cmd || ''), { query: args[0] });
      }
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
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exit(1);
});
