import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getJobStatus } from '../../api/ollama.js';

export const statusCommand = new Command('status')
  .description('Get job status')
  .argument('<jobId>', 'Job ID')
  .action(async (jobId) => {
    try {
      const spinner = ora('Fetching job status...').start();

      const job = await getJobStatus(jobId);

      spinner.stop();

      console.log(chalk.blue(`\nJob Status:\n`));
      console.log(`ID:       ${job.id}`);
      console.log(`Model:    ${job.modelName}`);
      console.log(`Type:     ${job.jobType}`);
      console.log(`Status:   ${job.status}`);
      console.log(`Name:     ${job.jobName || 'N/A'}`);
      console.log(`Created:  ${job.createdAt}`);
      if (job.updatedAt) {
        console.log(`Updated:  ${job.updatedAt}`);
      }
    } catch (error) {
      console.error(
        chalk.red('Error getting job status:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
