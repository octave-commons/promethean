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

export const listCommand = new Command('list')
  .description('List recent events')
  .option('-l, --limit <number>', 'Number of events to return', '50')
  .option('--type <type>', 'Filter by event type (e.g., session.updated)')
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    try {
      const client = await getClient();
      const events = await (client.event?.list?.({
        // If the SDK supports params, include them; otherwise the method ignores
        // @ts-expect-error undocumented
        limit: parseInt(options.limit),
        type: options.type,
      }) ?? client.get?.('/event', { query: { limit: parseInt(options.limit), type: options.type } }));

      const list = (events as any).events ?? (events as any) ?? [];

      if (options.json) {
        console.log(JSON.stringify(list, null, 2));
        return;
      }

      if (!list.length) {
        console.log(chalk.yellow('No events found'));
        return;
      }

      console.log(chalk.blue(`\nFound ${list.length} events:\n`));
      for (const ev of list) {
        const time = ev.time || ev.timestamp || ev.createdAt || '';
        const type = ev.type || ev.event || 'event';
        console.log(`${chalk.gray(time)} ${chalk.cyan(type)} ${ev.sessionId ?? ''}`);
      }
    } catch (error) {
      console.error(chalk.red('Error listing events:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
