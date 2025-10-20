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
      const sub = await client.event.subscribe();
      console.log(chalk.green('Subscribed to events. Press Ctrl-C to exit.'));
      for await (const ev of sub.stream) {
        const type = ev.type || 'event';
        let sid = '';

        // Handle different event types
        if (ev.type === 'session.updated' || ev.type === 'session.deleted') {
          sid = ev.properties?.info?.id ? ` session=${ev.properties.info.id}` : '';
        } else if (ev.type === 'message.updated' || ev.type === 'message.removed') {
          sid = ev.properties?.sessionID ? ` session=${ev.properties.sessionID}` : '';
        }

        console.log(`${chalk.cyan(type)}${sid}`);
      }
    } catch (error) {
      console.error(
        chalk.red('Error subscribing to events:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
