import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getQueueInfo } from '../../api/ollama.js';

export const infoCommand = new Command('info')
  .description('Get queue information')
  .action(async () => {
    try {
      const spinner = ora('Fetching queue info...').start();

      const info = await getQueueInfo();

      spinner.stop();

      console.log(chalk.blue(`\nQueue Information:\n`));
      console.log(JSON.stringify(info, null, 2));
    } catch (error) {
      console.error(
        chalk.red('Error getting queue info:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
