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

      const searchResult = JSON.parse(result);

      if (searchResult.results.length === 0) {
        console.log(chalk.yellow('No sessions found'));
        return;
      }

      console.log(chalk.blue(`Found ${searchResult.results.length} sessions:\n`));
      searchResult.results.forEach((session: any) => {
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
