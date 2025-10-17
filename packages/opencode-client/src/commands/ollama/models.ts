import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { listModels } from '../../api/ollama.js';

export const modelsCommand = new Command('models')
  .description('List available models')
  .option('-d, --detailed', 'Show detailed model information', false)
  .action(async (options) => {
    try {
      const spinner = ora('Fetching models...').start();

      const models = await listModels(options.detailed);

      spinner.stop();

      if (models.length === 0) {
        console.log(chalk.yellow('No models found'));
        return;
      }

      console.log(chalk.blue(`\nAvailable Models:\n`));

      if (options.detailed) {
        console.log(JSON.stringify(models, null, 2));
      } else {
        console.log('Name\t\tSize\tModified');
        console.log('-'.repeat(50));

        models.forEach((model: any) => {
          console.log(`${model.name}\t${model.size || 'N/A'}\t${model.modified_at || 'N/A'}`);
        });
      }
    } catch (error) {
      console.error(
        chalk.red('Error listing models:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
