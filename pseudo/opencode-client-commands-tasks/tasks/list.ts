import { Command } from 'commander';
import chalk from 'chalk';

export const listTasksCommand = new Command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'filter by status (idle, running, completed, failed)')
  .option('-j, --json', 'output in JSON format')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Listing tasks...'));

      // Mock implementation - no tasks available
      const tasks: any[] = [];

      if (options.json) {
        console.log(JSON.stringify(tasks, null, 2));
      } else {
        console.log(chalk.yellow('No tasks found (mock implementation)'));
      }
    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error);
      process.exit(1);
    }
  });
