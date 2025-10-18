import { Command } from 'commander';
import chalk from 'chalk';

export const getTaskCommand = new Command('get')
  .description('Get task details')
  .argument('<taskId>', 'task ID to retrieve')
  .action(async (taskId: string) => {
    try {
      console.log(chalk.blue(`📖 Getting task: ${taskId}`));
      // TODO: Implement task get logic
      console.log(chalk.yellow('Task get not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error getting task:'), error);
      process.exit(1);
    }
  });
