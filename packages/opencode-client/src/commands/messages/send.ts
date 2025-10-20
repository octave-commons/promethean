import { Command } from 'commander';
import chalk from 'chalk';
import { createOpencodeClient } from '@opencode-ai/sdk';

export const sendMessageCommand = new Command('send')
  .description('Send a message to a session')
  .argument('<sessionId>', 'session ID')
  .argument('<content>', 'message content')
  .option('-f, --file <path>', 'read message content from file')
  .option('--model-provider <provider>', 'model provider (e.g., openai, anthropic)')
  .option('--model-id <model>', 'model ID (e.g., gpt-4, claude-3-sonnet)')
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
      console.log(
        chalk.gray(
          `Content: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
        ),
      );

      // Send message via OpenCode client
      const client = createOpencodeClient({
        baseUrl: 'http://localhost:4096',
      });

      const result = await client.session.prompt({
        path: { id: sessionId },
        body: { parts: [{ type: 'text' as const, text: messageContent }] },
      });

      console.log(chalk.green('✅ Message sent successfully!'));
      console.log(`Session: ${chalk.cyan(sessionId)}`);

      if (result.data?.info?.id) {
        console.log(`Message ID: ${chalk.cyan(result.data.info.id)}`);
      }

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red('Error sending message:'), error);
      process.exit(1);
    }
  });
