import { Command } from 'commander';
import chalk from 'chalk';
import { randomUUID } from 'crypto';

export const sendMessageCommand = new Command('send')
  .description('Send a message to a session')
  .argument('<sessionId>', 'session ID')
  .argument('<content>', 'message content')
  .option('-t, --type <type>', 'message type (user, assistant, system)', 'user')
  .option('-f, --file <path>', 'read message content from file')
  .action(async (sessionId: string, content: string, options) => {
    try {
      let messageContent = content;

      // Read from file if specified
      if (options.file) {
        try {
          const fs = await import('fs');
          messageContent = fs.readFileSync(options.file, 'utf8');
          console.log(chalk.gray(`Loaded message from file: ${options.file}`));
        } catch (fileError) {
          throw new Error(`Failed to read file: ${fileError}`);
        }
      }

      console.log(chalk.blue(`📤 Sending message to session ${sessionId}`));
      console.log(chalk.gray(`Type: ${options.type}`));
      console.log(
        chalk.gray(
          `Content: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
        ),
      );

      // Create message object
      const message = {
        info: {
          id: randomUUID(),
          type: options.type,
          timestamp: new Date().toISOString(),
        },
        parts: [
          {
            type: 'text',
            text: messageContent,
          },
        ],
      };

      // For now, this is a placeholder implementation
      // In a real implementation, this would send to the actual session
      console.log(chalk.yellow('Message sending not yet fully implemented'));
      console.log(chalk.gray('Message would be sent to session store and processed'));

      if (options.type === 'user') {
        console.log(chalk.green('✅ User message prepared successfully!'));
        console.log(`Message ID: ${chalk.cyan(message.info.id)}`);
        console.log(`Session: ${chalk.cyan(sessionId)}`);
      } else {
        console.log(chalk.green(`✅ ${options.type} message prepared successfully!`));
      }
    } catch (error) {
      console.error(chalk.red('Error sending message:'), error);
      process.exit(1);
    }
  });
