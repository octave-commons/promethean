import { Command } from 'commander';
import chalk from 'chalk';
import { search } from '../../actions/sessions/search.js';

export const searchSessions = new Command('search')
  .description('Search past sessions by semantic embedding')
  .argument('<query>', 'Search query')
  .option('-k, --count <number>', 'Number of results to return', '5')
  .action(async (query, options) => {
    try {
      const result = await search({
        query,
        k: parseInt(options.count),
      });

      // Handle error case
      if ('error' in result) {
        console.error(chalk.red('Error searching sessions:'), result.error);
        process.exit(1);
      }

      if (result.results.length === 0) {
        console.log(chalk.yellow('No sessions found'));
        return;
      }

      console.log(chalk.blue(`Found ${result.results.length} sessions:\n`));
      result.results.forEach((session: any) => {
        const title = session.title || 'Untitled';
        const id = session.id || 'Unknown';
        const messageCount = session.messageCount || 0;
        console.log(`${id}: ${title} (${messageCount} messages)`);
      });

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(
        chalk.red('Error searching sessions:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
