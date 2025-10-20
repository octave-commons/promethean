import { Command } from 'commander';
import chalk from 'chalk';

export const getTaskCommand = new Command('get')
  .description('Get task details')
  .argument('<sessionId>', 'session ID to retrieve task for')
  .option('-j, --json', 'output in JSON format')
  .action(async (sessionId: string, options) => {
    try {
      console.log(chalk.blue(`📖 Getting task for session: ${sessionId}`));

      // Mock task retrieval since we don't have a context
      console.log(chalk.yellow(`No task found for session: ${sessionId} (mock implementation)`));
    } catch (error) {
      console.error(chalk.red('Error getting task:'), error);
      process.exit(1);
    }
  });
