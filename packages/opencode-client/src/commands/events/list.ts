import { Command } from 'commander';
import chalk from 'chalk';
import { list as listEvents } from '../../actions/events/list.js';
import { eventListSerializer } from '../../serializers/event.js';

export const listCommand = new Command('list')
  .description('List recent events')
  .option('-l, --limit <number>', 'Number of events to return', '50')
  .option('--type <type>', 'Filter by event type (e.g., session.updated)')
  .option('--format <format>', 'Output format (text|json|markdown)', 'text')
  .option('-k, --count <number>', 'Maximum number of events to return')
  .option('--session <sessionId>', 'Filter by session ID')
  .option('--query <query>', 'Search query for events')
  .action(async (options) => {
    try {
      const result = await listEvents({
        eventType: options.type,
        sessionId: options.session,
        query: options.query,
        k: options.count ? parseInt(options.count) : undefined,
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.format === 'markdown') {
        const eventListResult = { events: result };
        console.log(eventListSerializer.serialize(eventListResult));
      } else {
        console.log(chalk.blue(`Recent Events (${result.length}):`));
        result.forEach((event: any) => {
          console.log(
            `${chalk.gray(event._timestamp || 'Unknown time')} - ${chalk.cyan(event.type || 'Unknown type')}`,
          );
          if (event.sessionId) {
            console.log(`  Session: ${event.sessionId}`);
          }
          if (event.description) {
            console.log(`  ${event.description}`);
          }
          console.log('');
        });
      }

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(
        chalk.red('Error listing events:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
