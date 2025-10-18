import { Command } from 'commander';
import chalk from 'chalk';
import { manageCache } from '../../actions/cache/index.js';

export const clearCacheCommand = new Command('clear')
  .description('Clear cache entries')
  .option('-a, --all', 'clear all cache entries')
  .option('-e, --expired', 'clear only expired entries')
  .option('-j, --json', 'output in JSON format')
  .action(async (options) => {
    try {
      if (!options.all && !options.expired) {
        console.log(chalk.yellow('Please specify either --all or --expired'));
        return;
      }

      console.log(chalk.blue('🧹 Clearing cache...'));

      const action = options.expired ? 'clear-expired' : 'clear';
      const result = await manageCache(action);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (action === 'clear') {
          console.log(chalk.green(`✅ Cleared ${result.clearedEntries} cache entries`));
        } else {
          console.log(chalk.yellow(result.message));
          console.log(chalk.gray(`Current cache size: ${result.size} entries`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Error clearing cache:'), error);
      process.exit(1);
    }
  });
