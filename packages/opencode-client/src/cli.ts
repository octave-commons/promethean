#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { sessionCommands } from './commands/sessions/index.js';
import { ollamaCommands } from './commands/ollama/index.js';
import { pm2Command } from './commands/pm2/index.js';
import { eventCommands } from './commands/events/index.js';
import { initializeStores } from './index.js';
import { DualStoreManager } from '@promethean/persistence';
const version = '1.0.0';

// Initialize dual stores for CLI use
let storesInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeCliStores() {
  if (storesInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
      const agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');

      initializeStores(sessionStore, agentTaskStore);
      storesInitialized = true;

      if (process.env.OPENCODE_DEBUG) {
        console.log(chalk.gray('CLI stores initialized'));
      }
    } catch (error) {
      console.warn(chalk.yellow('Warning: Failed to initialize CLI stores:', error));
    }
  })();

  return initPromise;
}

const program = new Command();

program
  .name('opencode-client')
  .description('CLI client for OpenCode plugins and tools')
  .version(version);

// Global options
program
  .option('-v, --verbose', 'verbose output')
  .option('--no-color', 'disable colored output')
  .hook('preAction', async (thisCommand) => {
    // Initialize stores before any command runs
    await initializeCliStores();

    const options = thisCommand.opts();
    if (options.verbose) {
      console.log(chalk.gray('Verbose mode enabled'));
    }
  });

// Add command groups
program.addCommand(sessionCommands);
program.addCommand(ollamaCommands);
program.addCommand(pm2Command);
program.addCommand(eventCommands);

// Error handling - let commander handle help/version normally

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Unexpected error:'), error.message);
  if (program.opts().verbose) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse and execute
program.parse();
