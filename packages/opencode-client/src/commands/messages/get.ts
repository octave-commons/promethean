import { Command } from 'commander';
import chalk from 'chalk';
import { getSessionMessages, type Message } from '../../api/sessions.js';

export const getMessageCommand = new Command('get')
  .description('Get message details')
  .argument('<messageId>', 'message ID to retrieve')
  .option('-s, --session <sessionId>', 'session ID to search in')
  .option('-j, --json', 'output in JSON format')
  .action(async (messageId: string, options) => {
    try {
      if (!options.session) {
        console.log(chalk.yellow('Session ID is required to search for messages'));
        console.log(chalk.gray('Use: opencode messages get <messageId> --session <sessionId>'));
        setImmediate(() => process.exit(1));
        return;
      }

      const messages = await getSessionMessages(options.session);
      const message = messages.find((msg: Message) => msg.info.id === messageId);

      if (!message) {
        console.log(chalk.red(`Message ${messageId} not found in session ${options.session}`));
        setImmediate(() => process.exit(1));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(message, null, 2));
      } else {
        console.log(chalk.green('Message Details:'));
        console.log(`ID: ${chalk.cyan(message.info.id)}`);
        console.log(`Role: ${chalk.yellow(message.info.role)}`);
        console.log(`Created: ${chalk.gray(new Date(message.info.time.created).toLocaleString())}`);
        console.log(`Updated: ${chalk.gray(new Date(message.info.time.updated).toLocaleString())}`);

        if (message.parts && message.parts.length > 0) {
          console.log(chalk.blue('\nContent:'));
          message.parts.forEach((part, index) => {
            if (part.type === 'text' && part.text) {
              console.log(`${chalk.gray(`[${index + 1}]`)} ${part.text}`);
            } else {
              console.log(`${chalk.gray(`[${index + 1}]`)} ${chalk.yellow(part.type)} part`);
            }
          });
        }
      }

      setImmediate(() => process.exit(0));
    } catch (error) {
      console.error(chalk.red('Error getting message:'), error);
      setImmediate(() => process.exit(1));
    }
  });
