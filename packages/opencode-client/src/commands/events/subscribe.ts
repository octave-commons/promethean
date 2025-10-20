import { Command } from 'commander';
import chalk from 'chalk';
import { createOpencodeClient } from '@opencode-ai/sdk';

export const subscribeCommand = new Command('subscribe')
  .description('Subscribe to event stream and print as they arrive')
  .option('--type <type>', 'Filter by event type (e.g., session.updated)')
  .action(async (options) => {
    try {
      const client = createOpencodeClient({
        baseUrl: 'http://localhost:4096',
      });
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
      console.error(
        chalk.red('Error subscribing to events:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
