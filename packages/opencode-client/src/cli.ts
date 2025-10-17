#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { sessionCommands } from './commands/sessions/index.js';
import { ollamaCommands } from './commands/ollama/index.js';
import { pm2Commands } from './commands/pm2/index.js';
import { version } from '../package.json';

const program = new Command();

program.name('opencode').description('CLI client for OpenCode plugins and tools').version(version);

// Global options
program
  .option('-v, --verbose', 'verbose output')
  .option('--no-color', 'disable colored output')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    if (options.verbose) {
      console.log(chalk.gray('Verbose mode enabled'));
    }
  });

// Add command groups
program.addCommand(sessionCommands);
program.addCommand(ollamaCommands);
program.addCommand(pm2Commands);

// Error handling
program.exitOverride();

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
