import { Command } from 'commander';
import chalk from 'chalk';

export const clearCacheCommand = new Command('clear')
  .description('Clear cache entries')
  .option('-k, --key <key>', 'clear specific key')
  .option('-a, --all', 'clear all cache entries')
  .action(async (_options) => {
    try {
      console.log(chalk.blue('🧹 Clearing cache...'));
      // TODO: Implement cache clear logic
      console.log(chalk.yellow('Cache clear not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error clearing cache:'), error);
      process.exit(1);
    }
  });
