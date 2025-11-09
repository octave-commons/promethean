import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { updateJobStatus } from '../../actions/ollama/jobs.js';

export const cancelCommand = new Command('cancel')
  .description('Cancel a job')
  .argument('<jobId>', 'Job ID')
  .action(async (jobId) => {
    try {
      const spinner = ora('Cancelling job...').start();

      updateJobStatus(jobId, 'canceled');

      spinner.stop();
      console.log(chalk.green(`Job ${jobId} cancelled successfully`));
    } catch (error) {
      console.error(
        chalk.red('Error cancelling job:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
