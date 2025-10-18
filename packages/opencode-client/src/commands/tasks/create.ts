import { Command } from 'commander';
import chalk from 'chalk';

export const createTaskCommand = new Command('create')
  .description('Create a new task')
  .argument('<description>', 'task description')
  .option('-p, --priority <priority>', 'task priority (low, medium, high, urgent)')
  .action(async (description: string, _options) => {
    try {
      console.log(chalk.blue(`➕ Creating task: ${description}`));
      // TODO: Implement task create logic
      console.log(chalk.yellow('Task create not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error creating task:'), error);
      process.exit(1);
    }
  });
