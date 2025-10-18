import { Command } from 'commander';
import chalk from 'chalk';

export const listMessagesCommand = new Command('list')
  .description('List messages')
  .argument('<sessionId>', 'session ID')
  .option('-l, --limit <number>', 'limit number of messages')
  .action(async (sessionId: string, _options) => {
    try {
      console.log(chalk.blue(`📋 Listing messages for session: ${sessionId}`));
      // TODO: Implement message listing logic
      console.log(chalk.yellow('Message listing not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error listing messages:'), error);
      process.exit(1);
    }
  });
