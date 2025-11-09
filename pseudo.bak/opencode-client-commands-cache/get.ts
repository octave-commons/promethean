import { Command } from 'commander';
import chalk from 'chalk';
import { checkCache } from '../../actions/cache/index.js';
import { JobType } from '@promethean/ollama-queue';

export const getCacheCommand = new Command('get')
  .description('Check cache for a prompt')
  .argument('<prompt>', 'prompt to check in cache')
  .option('-m, --model <model>', 'model name', 'llama3.2:3b')
  .option('-t, --type <type>', 'job type', 'generate')
  .action(async (prompt: string, options) => {
    try {
      console.log(chalk.blue(`📖 Checking cache for prompt: "${prompt.substring(0, 50)}..."`));
      console.log(chalk.gray(`Model: ${options.model}, Type: ${options.type}`));

      const result = await checkCache(prompt, options.model, options.type as JobType);

      if (result) {
        console.log(chalk.green('✅ Cache hit!'));
        console.log(chalk.cyan('Cached response:'));
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.yellow('❌ Cache miss - no matching entry found'));
      }
    } catch (error) {
      console.error(chalk.red('Error checking cache:'), error);
      process.exit(1);
    }
  });
