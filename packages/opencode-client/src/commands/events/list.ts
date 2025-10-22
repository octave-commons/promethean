import { Command } from 'commander';
import chalk from 'chalk';

export const listCommand = new Command('list')
  .description('List recent events')
  .option('-l, --limit <number>', 'Number of events to return', '50')
  .option('--type <type>', 'Filter by event type (e.g., session.updated)')
  .option('--json', 'Output as JSON', false)
  .action(async () => {
    try {
      // Note: The OpenCode SDK only supports event subscription, not listing historical events
      // For historical events, we would need to index them from session data
      console.log(
        chalk.yellow('Event listing not supported - only live subscription is available'),
      );
      console.log(chalk.gray('Use "events subscribe" to listen for new events'));
      return;
    } catch (error) {
      console.error(
        chalk.red('Error listing events:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
