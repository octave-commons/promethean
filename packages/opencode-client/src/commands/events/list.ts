import { Command } from 'commander';
import chalk from 'chalk';
import { createOpencodeClient } from '@opencode-ai/sdk';

export const listCommand = new Command('list')
  .description('List recent events')
  .option('-l, --limit <number>', 'Number of events to return', '50')
  .option('--type <type>', 'Filter by event type (e.g., session.updated)')
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    try {
      // Create OpenCode client
      const client = createOpencodeClient({
        baseUrl: 'http://localhost:4096',
      });

      const result = await client.event.list();

      const list = events as any[];

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
      console.error(
        chalk.red('Error listing events:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
