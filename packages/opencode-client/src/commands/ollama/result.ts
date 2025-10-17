import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getJobResult } from '../../api/ollama.js';

export const resultCommand = new Command('result')
  .description('Get job result')
  .argument('<jobId>', 'Job ID')
  .option('-j, --json', 'Output result as JSON', false)
  .action(async (jobId, options) => {
    try {
      const spinner = ora('Fetching job result...').start();

      const result = await getJobResult(jobId);

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.blue(`\nJob Result for ${jobId}:\n`));
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error(
        chalk.red('Error getting job result:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
