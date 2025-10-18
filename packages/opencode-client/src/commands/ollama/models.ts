import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { listModels } from '../../api/ollama.js';

const modelsCommand = new Command('models')
  .description('List available models')
  .option('-d, --detailed', 'Show detailed model information', false)
  .option('-f, --format <format>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    try {
      const spinner = ora('Fetching models...').start();

      const models = await listModels(options.detailed);

      spinner.stop();

      if (models.length === 0) {
        console.log(chalk.yellow('No models found'));
        process.exit(0);
      }

      console.log(chalk.blue(`\nAvailable Models:\n`));

      if (options.format === 'json') {
        console.log(JSON.stringify(models, null, 2));
      } else if (options.detailed) {
        console.log(JSON.stringify(models, null, 2));
      } else {
        console.log('Name\t\tSize\tModified');
        console.log('-'.repeat(50));

        models.forEach((model: any) => {
          if (typeof model === 'string') {
            // When detailed=false, models is an array of strings
            console.log(`${model}\tN/A\tN/A`);
          } else {
            // When detailed=true, models is an array of objects
            const name = model.name || 'N/A';
            const size = model.size ? formatBytes(model.size) : 'N/A';
            const modified = model.modified_at
              ? new Date(model.modified_at).toLocaleDateString()
              : 'N/A';
            console.log(`${name}\t${size}\t${modified}`);
          }
        });
      }

      // Explicit process exit to prevent hanging
      process.exit(0);
    } catch (error) {
      console.error(
        chalk.red('Error listing models:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export { modelsCommand };
