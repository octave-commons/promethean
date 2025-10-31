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
  COMMAND_HANDLERS,
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

function setupBaseProgram(): Command {
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

  return program;
}

function setupHooks(program: Command): void {
  // Pre-action hook: initialize config and logging
  program.hook('preAction', async (thisCommand: Command) => {
    const options = thisCommand.opts();

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
  });

  // Post-action hook: cleanup
  program.hook('postAction', async () => {
    // Cleanup can be added here if needed
  });
}

function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize kanban board and tasks directory')
    .allowUnknownOption(true)
    .action(async (...args) => {
      const options = program.opts();
      const context: CliContext = {
        boardFile: (options.kanban as string) || '',
        tasksDir: (options.tasks as string) || '',
        argv: process.argv.slice(2),
      };

      try {
        const result = await executeCommand('init', args, context);
        if (typeof result !== 'undefined' && result !== null) {
          if (options.json) {
            printJSONL(result);
          } else {
            printMarkdown(result, detectOutputType('init'), { query: (args[0] as string) || '' });
          }
        }
      } catch (error: unknown) {
        if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
          console.error(error.message);
          process.exit(2);
        }
        throw error;
      }
    });
}

function registerProcessCommands(program: Command): void {
  program
    .command('process_sync')
    .description('Sync process documentation')
    .action(async () => {
      const res = await processSync({
        processFile: process.env.KANBAN_PROCESS_FILE,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_TOKEN,
      });
      printJSONL(res);
    });

  program
    .command('doccheck')
    .description('Check documentation for PR')
    .argument('[pr]', 'PR number')
    .action(async (pr: string | undefined) => {
      await docguard({
        pr: pr || process.env.PR_NUMBER,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_TOKEN,
      });
    });
}

function registerSpecialCommands(program: Command): void {
  registerInitCommand(program);
  registerProcessCommands(program);
}

type ProgramOptions = {
  kanban?: string;
  tasks?: string;
  json?: boolean;
  logLevel?: string;
};

async function createContext(options: ProgramOptions): Promise<CliContext> {
  // Load config for non-init commands
  const { config } = await loadKanbanConfig({
    argv: process.argv.slice(2),
    env: applyLegacyEnv(process.env),
  });

  const boardFile = options.kanban || config.boardFile;
  const tasksDir = options.tasks || config.tasksDir;

  return { boardFile, tasksDir, argv: process.argv.slice(2) };
}

function registerStandardCommands(program: Command): void {
  for (const [commandName] of Object.entries(COMMAND_HANDLERS)) {
    const cmd = program.command(commandName).allowUnknownOption(true);

    cmd.action(async (...args) => {
      const options = program.opts();
      const context = await createContext(options);

      try {
        const result = await executeCommand(commandName, args, context);
        if (typeof result !== 'undefined' && result !== null) {
          if (options.json) {
            printJSONL(result);
          } else {
            printMarkdown(result, detectOutputType(commandName), { query: args[0] as string });
          }
        }
      } catch (error: unknown) {
        if (error instanceof CommandUsageError || error instanceof CommandNotFoundError) {
          console.error(error.message);
          process.exit(2);
        }
        throw error;
      }
    });
  }
}

function createProgram(): Command {
  const program = setupBaseProgram();
  setupHooks(program);
  registerSpecialCommands(program);
  registerStandardCommands(program);
  return program;
}

async function main(): Promise<void> {
  const program = createProgram();

  // Process-level error handling
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Graceful shutdown on SIGINT/SIGTERM
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    console.error(message);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exit(1);
});
