import { Command } from 'commander';
import chalk from 'chalk';

export const listTasksCommand = new Command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'filter by status')
  .action(async (_options) => {
    try {
      console.log(chalk.blue('📋 Listing tasks...'));
      // TODO: Implement task listing logic
      console.log(chalk.yellow('Task listing not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error);
      process.exit(1);
    }
  });
