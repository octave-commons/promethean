import { Command } from 'commander';
import chalk from 'chalk';

export const sendMessageCommand = new Command('send')
  .description('Send a message')
  .argument('<sessionId>', 'session ID')
  .argument('<content>', 'message content')
  .option('-t, --type <type>', 'message type', 'user')
  .action(async (sessionId: string, content: string, options) => {
    try {
      console.log(chalk.blue(`📤 Sending message to session ${sessionId}`));
      // TODO: Implement message send logic
      console.log(chalk.yellow('Message send not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error sending message:'), error);
      process.exit(1);
    }
  });
