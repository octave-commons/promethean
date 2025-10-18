import { Command } from 'commander';
import chalk from 'chalk';
import { manageCache } from '../../actions/cache/index.js';

export const listCacheCommand = new Command('list')
  .description('List cache entries and statistics')
  .option('-j, --json', 'output in JSON format')
  .option('-m, --model <model>', 'filter by specific model')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Listing cache entries...'));

      const stats = await manageCache('stats');

      if (options.json) {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        console.log(chalk.green(`Total cache entries: ${stats.totalSize}`));
        console.log(chalk.green(`Models cached: ${stats.modelCount}`));
        console.log(chalk.gray(`Similarity threshold: ${stats.similarityThreshold}`));
        console.log(chalk.gray(`Max age: ${stats.maxAgeHours.toFixed(1)} hours`));

        if (stats.models.length > 0) {
          console.log(chalk.blue('\nModel breakdown:'));
          stats.models.forEach((model: any) => {
            console.log(`  ${model.model}: ${model.size} entries`);
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('Error listing cache:'), error);
      process.exit(1);
    }
  });
