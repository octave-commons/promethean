import { Command } from 'commander';
import chalk from 'chalk';
import { getSessionMessages } from '../../api/sessions.js';

export const listMessagesCommand = new Command('list')
  .description('List messages for a session')
  .argument('<sessionId>', 'session ID')
  .option('-l, --limit <number>', 'limit number of messages', '10')
  .option('-j, --json', 'output in JSON format')
  .action(async (sessionId: string, options) => {
    try {
      console.log(chalk.blue(`📋 Listing messages for session: ${sessionId}`));

      const messages = await getSessionMessages(sessionId);
      const limit = parseInt(options.limit, 10);
      const limitedMessages = messages.slice(-limit);

      if (options.json) {
        console.log(JSON.stringify(limitedMessages, null, 2));
      } else {
        if (limitedMessages.length === 0) {
          console.log(chalk.yellow('No messages found for this session'));
          return;
        }

        console.log(chalk.green(`Found ${limitedMessages.length} recent messages:`));
        limitedMessages.forEach((message: any, index: number) => {
          const textParts = message.parts?.filter((part: any) => part.type === 'text') || [];
          const text = textParts.map((part: any) => part.text).join(' ') || '[No text content]';
          const timestamp = message.info?.time?.created || new Date().toISOString();

          console.log(`\n${chalk.cyan(`Message ${index + 1}:`)}`);
          console.log(`  ID: ${message.info?.id || 'unknown'}`);
          console.log(`  Role: ${message.info?.role || 'unknown'}`);
          console.log(`  Time: ${new Date(timestamp).toLocaleString()}`);
          console.log(`  Content: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
        });
      }

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red('Error listing messages:'), error);
      process.exit(1);
    }
  });
