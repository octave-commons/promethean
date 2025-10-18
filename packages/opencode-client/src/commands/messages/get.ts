import { Command } from 'commander';
import chalk from 'chalk';

export const getMessageCommand = new Command('get')
  .description('Get message details')
  .argument('<messageId>', 'message ID to retrieve')
  .action(async (messageId: string) => {
    try {
      console.log(chalk.blue(`📖 Getting message: ${messageId}`));
      // TODO: Implement message get logic
      console.log(chalk.yellow('Message get not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error getting message:'), error);
      process.exit(1);
    }
  });
