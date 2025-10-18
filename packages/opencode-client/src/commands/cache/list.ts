import { Command } from 'commander';
import chalk from 'chalk';

export const listCacheCommand = new Command('list')
  .description('List cache entries')
  .option('-k, --key <key>', 'filter by key pattern')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Listing cache entries...'));
      // TODO: Implement cache listing logic
      console.log(chalk.yellow('Cache listing not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error listing cache:'), error);
      process.exit(1);
    }
  });
