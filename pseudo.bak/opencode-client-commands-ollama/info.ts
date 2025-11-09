import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { check } from '../../actions/ollama/api.js';
import { OLLAMA_URL } from '@promethean/ollama-queue';

export const infoCommand = new Command('info')
  .description('Get queue information')
  .action(async () => {
    try {
      const spinner = ora('Fetching queue info...').start();

      const res = await fetch(`${OLLAMA_URL}/api/version`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      await check(res, 'get ollama info');
      const info = await res.json();

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
