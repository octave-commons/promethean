import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { jobQueue } from '@promethean/ollama-queue';

export const listCommand = new Command('list')
  .description('List Ollama jobs')
  .option(
    '-s, --status <status>',
    'Filter by status (pending, running, completed, failed, canceled)',
  )
  .option('-l, --limit <limit>', 'Limit number of results', '50')
  .option('-a, --all', 'Include all jobs (not just agent jobs)', false)
  .option('-f, --format <format>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    try {
      const spinner = ora('Fetching jobs...').start();

      let jobs = jobQueue;
      if (options.status) {
        jobs = jobs.filter((job) => job.status === options.status);
      }
      if (options.limit) {
        jobs = jobs.slice(0, parseInt(options.limit));
      }
      if (!options.all) {
        jobs = jobs.filter((job) => job.agentId !== undefined);
      }

      spinner.stop();

      if (jobs.length === 0) {
        console.log(chalk.yellow('No jobs found'));
        return;
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(jobs, null, 2));
        return;
      }

      console.log(
        chalk.blue(`
Found ${jobs.length} jobs:
`),
      );

      // Create a simple table
      console.log('ID\t\tStatus\t\tModel\t\tName');
      console.log('-'.repeat(80));

      jobs.forEach((job) => {
        const status =
          job.status === 'completed'
            ? chalk.green(job.status)
            : job.status === 'failed'
              ? chalk.red(job.status)
              : job.status === 'running'
                ? chalk.yellow(job.status)
                : job.status;

        console.log(`${job.id}\t${status}\t${job.modelName}\t${job.name || 'N/A'}`);
      });
    } catch (error) {
      console.error(
        chalk.red('Error listing jobs:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
