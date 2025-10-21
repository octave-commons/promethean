import { Command } from 'commander';
import chalk from 'chalk';

async function getClient(): Promise<any> {
  const baseURL = process.env.OPENCODE_SERVER_URL;
  const timeout = process.env.OPENCODE_TIMEOUT ? Number(process.env.OPENCODE_TIMEOUT) : undefined;
  const maxRetries = process.env.OPENCODE_RETRIES ? Number(process.env.OPENCODE_RETRIES) : undefined;
  const logLevel = (process.env.OPENCODE_LOG_LEVEL as any) || undefined;
  const authHeader = process.env.OPENCODE_AUTH_TOKEN
    ? { Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}` }
    : undefined;
  const sdk: any = await import('@opencode-ai/sdk');
  if (typeof sdk.createOpencode === 'function') {
    const r = await sdk.createOpencode({ serverUrl: baseURL, timeout, maxRetries, logLevel, fetchOptions: { headers: authHeader } });
    return r.client ?? r;
  }
  if (typeof sdk.createOpencodeClient === 'function') {
    return await sdk.createOpencodeClient({ serverUrl: baseURL, timeout, maxRetries, logLevel, fetchOptions: { headers: authHeader } });
  }
  if (typeof sdk.default === 'function') {
    return new sdk.default({ baseURL, timeout, maxRetries, logLevel, fetchOptions: { headers: authHeader } });
  }
  throw new Error('Unable to initialize @opencode-ai/sdk client');
}

export const subscribeCommand = new Command('subscribe')
  .description('Subscribe to event stream and print as they arrive')
  .option('--type <type>', 'Filter by event type (e.g., session.updated)')
  .action(async (options) => {
    try {
      const client = await getClient();
      if (typeof client.event?.subscribe !== 'function') {
        console.error(chalk.red('This SDK/server does not support event.subscribe().'));
        process.exit(1);
      }
      const sub = await client.event.subscribe({ type: options.type });
      console.log(chalk.green('Subscribed to events. Press Ctrl-C to exit.'));
      for await (const ev of sub.stream) {
        const time = ev.time || ev.timestamp || ev.createdAt || '';
        const type = ev.type || ev.event || 'event';
        const sid = ev.sessionId ? ` session=${ev.sessionId}` : '';
        console.log(`${chalk.gray(time)} ${chalk.cyan(type)}${sid}`);
      }
    } catch (error) {
      console.error(chalk.red('Error subscribing to events:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
