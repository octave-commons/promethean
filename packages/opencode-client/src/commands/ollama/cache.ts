import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { manageCache } from '../../api/ollama.js';

export const cacheCommand = new Command('cache')
  .description('Manage prompt cache')
  .argument('<action>', 'Cache action: stats, clear, clear-expired, performance-analysis')
  .action(async (action) => {
    try {
      const validActions = ['stats', 'clear', 'clear-expired', 'performance-analysis'];

      if (!validActions.includes(action)) {
        console.error(chalk.red(`Invalid action: ${action}`));
        console.log(chalk.yellow(`Valid actions: ${validActions.join(', ')}`));
        process.exit(1);
      }

      const spinner = ora(`Performing cache ${action}...`).start();

      const result = await manageCache(action);

      spinner.stop();

      console.log(chalk.blue(`\nCache ${action} result:\n`));
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(
        chalk.red('Error managing cache:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
