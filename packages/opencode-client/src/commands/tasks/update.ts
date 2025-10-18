import { Command } from 'commander';
import chalk from 'chalk';

export const updateTaskCommand = new Command('update')
  .description('Update task status')
  .argument('<taskId>', 'task ID to update')
  .argument('<status>', 'new status')
  .action(async (taskId: string, status: string) => {
    try {
      console.log(chalk.blue(`🔄 Updating task ${taskId} to status: ${status}`));
      // TODO: Implement task update logic
      console.log(chalk.yellow('Task update not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error updating task:'), error);
      process.exit(1);
    }
  });
