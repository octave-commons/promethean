#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { sessionCommands } from './commands/sessions/index.js';
import { eventCommands } from './commands/events/index.js';
import { messagesCommands } from './commands/messages/index.js';
import { indexerCommands } from './commands/indexer/index.js';
import { spawnSessionCommand } from './commands/sessions/spawn.js';
import { initializeStores } from './initializeStores.js';

const program = new Command();
// Global options
program
  .option('-v, --verbose', 'verbose output')
  .option('--no-color', 'disable colored output')
  .hook('preAction', async (thisCommand) => {
    // Initialize stores before any command runs
    await initializeStores();

    const options = thisCommand.opts();
    if (options.verbose) {
      console.log(chalk.gray('Verbose mode enabled'));
    }
  })
  .hook('postAction', async () => {
    // Cleanup stores after command completes
    try {
      const { cleanupClients } = await import('@promethean/persistence');
      await cleanupClients();
    } catch (error) {
      // Ignore cleanup errors - connection might already be closed
    }
  });

// Add command groups
program.addCommand(sessionCommands);
program.addCommand(eventCommands);
program.addCommand(messagesCommands);
program.addCommand(indexerCommands);

// Add top-level spawn command for convenience
program.addCommand(spawnSessionCommand);

// Add unified agent management commands

// Error handling - let commander handle help/version normally

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('Uncaught exception:'));
  console.error(error.stack);
  try {
    const { cleanupClients } = await import('@promethean/persistence');
    await cleanupClients();
  } catch (cleanupError) {
    // Ignore cleanup errors
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error(chalk.red('Unhandled rejection at:'), promise, 'reason:', reason);
  try {
    const { cleanupClients } = await import('@promethean/persistence');
    await cleanupClients();
  } catch (cleanupError) {
    // Ignore cleanup errors
  }
  process.exit(1);
});

// Add cleanup hook for SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log(chalk.gray('\nShutting down...'));
  try {
    const { cleanupClients } = await import('@promethean/persistence');
    await cleanupClients();
  } catch (cleanupError) {
    // Ignore cleanup errors
  }
  process.exit(0);
});

// Add cleanup hook for SIGTERM
process.on('SIGTERM', async () => {
  console.log(chalk.gray('\nTerminating...'));
  try {
    const { cleanupClients } = await import('@promethean/persistence');
    await cleanupClients();
  } catch (cleanupError) {
    // Ignore cleanup errors
  }
  process.exit(0);
});

// Parse and execute
program.parse();
