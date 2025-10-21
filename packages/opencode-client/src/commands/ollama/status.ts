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
      console.log(`Name:     ${job.name || 'N/A'}`);
      console.log(`Status:   ${job.status}`);
      console.log(`Priority: ${job.priority || 'N/A'}`);
      console.log(`Created:  ${new Date(job.createdAt).toISOString()}`);
      if (job.updatedAt) {
        console.log(`Updated:  ${new Date(job.updatedAt).toISOString()}`);
      }
      if (job.startedAt) {
        console.log(`Started:  ${new Date(job.startedAt).toISOString()}`);
      }
      if (job.completedAt) {
        console.log(`Completed: ${new Date(job.completedAt).toISOString()}`);
      }
      if (job.error) {
        console.log(`Error:    ${job.error.message}`);
      }
    } catch (error) {
      console.error(
        chalk.red('Error getting job status:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
