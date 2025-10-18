import { Command } from 'commander';
import chalk from 'chalk';

export const getCacheCommand = new Command('get')
  .description('Get cache entry')
  .argument('<key>', 'cache key to retrieve')
  .action(async (key: string) => {
    try {
      console.log(chalk.blue(`📖 Getting cache entry: ${key}`));
      // TODO: Implement cache get logic
      console.log(chalk.yellow('Cache get not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error getting cache entry:'), error);
      process.exit(1);
    }
  });
