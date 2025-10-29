#!/usr/bin/env node
import { Command } from 'commander';
import { loadKanbanConfig } from './board/config.js';
import { printJSONL } from './lib/jsonl.js';
import { printMarkdown } from './lib/markdown-output.js';
import { processSync } from './process/sync.js';
import { docguard } from './process/docguard.js';
import {
  AVAILABLE_COMMANDS,
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
    .option('--log-level <level>', 'Set log level: silent, error, warn, info, debug (default: info)', 'info');

  // Add all available commands as subcommands
  const commandList = [...AVAILABLE_COMMANDS, 'process_sync', 'doccheck'];
  
  // Create a default command handler for all kanban commands
  program
    .argument('<command>', 'Command to execute', commandList.join('|'))
    .argument('[args...]', 'Command arguments')
    .description('Execute kanban command')
    .action(async (cmd: string, args: string[], _options, command) => {
      // cmd is now the first argument
      const globalOptions = command.parent?.opts() || {};
      
      // Set log level
      if (globalOptions.logLevel) {
        setLogLevel(globalOptions.logLevel as 'silent' | 'error' | 'warn' | 'info' | 'debug');
      }

      // Handle init command specially
      if (cmd === 'init') {
        const context: CliContext = {
          boardFile: globalOptions.kanban || '',
          tasksDir: globalOptions.tasks || '',
          argv: process.argv.slice(2),
        };

        try {
          const result = await executeCommand(cmd, args, context);
          if (typeof result !== 'undefined' && result !== null) {
            if (globalOptions.json) {
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

      const boardFile = globalOptions.kanban || config.boardFile;
      const tasksDir = globalOptions.tasks || config.tasksDir;

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
        const result = await executeCommand(cmd, args, context);
        if (typeof result !== 'undefined' && result !== null) {
          if (globalOptions.json) {
            printJSONL(result);
          } else {
            printMarkdown(result, detectOutputType(cmd), { query: args[0] });
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

  // Parse command line arguments
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exit(1);
});