import { Command } from 'commander';
import chalk from 'chalk';

async function getClient(): Promise<any> {
  const baseURL = process.env.OPENCODE_SERVER_URL;
  const timeout = process.env.OPENCODE_TIMEOUT ? Number(process.env.OPENCODE_TIMEOUT) : undefined;
  const maxRetries = process.env.OPENCODE_RETRIES
    ? Number(process.env.OPENCODE_RETRIES)
    : undefined;
  const logLevel = (process.env.OPENCODE_LOG_LEVEL as any) || undefined;
  const authHeader = process.env.OPENCODE_AUTH_TOKEN
    ? { Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}` }
    : undefined;
  const sdk: any = await import('@opencode-ai/sdk');
  if (typeof sdk.createOpencode === 'function') {
    const r = await sdk.createOpencode({
      serverUrl: baseURL,
      timeout,
      maxRetries,
      logLevel,
      fetchOptions: { headers: authHeader },
    });
    return r.client ?? r;
  }
  if (typeof sdk.createOpencodeClient === 'function') {
    return await sdk.createOpencodeClient({
      serverUrl: baseURL,
      timeout,
      maxRetries,
      logLevel,
      fetchOptions: { headers: authHeader },
    });
  }
  if (typeof sdk.default === 'function') {
    return new sdk.default({
      baseURL,
      timeout,
      maxRetries,
      logLevel,
      fetchOptions: { headers: authHeader },
    });
  }
  throw new Error('Unable to initialize @opencode-ai/sdk client');
}

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
      const client = await getClient();

      const result = await client.session.prompt({
        path: { id: sessionId },
        body: { parts: [{ type: 'text' as const, text: messageContent }] },
      });

      console.log(chalk.green('✅ Message sent successfully!'));
      console.log(`Session: ${chalk.cyan(sessionId)}`);

      if (result.data?.id) {
        console.log(`Message ID: ${chalk.cyan(result.data.id)}`);
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
