import { Command } from 'commander';
import chalk from 'chalk';
import { storeInCache } from '../../actions/cache/index.js';
import { JobType } from '@promethean/ollama-queue';
import { readFileSync } from 'fs';

export const setCacheCommand = new Command('set')
  .description('Store a prompt-response pair in cache')
  .argument('<prompt>', 'prompt to cache')
  .argument('<response>', 'response to cache (or JSON file path ending in .json)')
  .option('-m, --model <model>', 'model name', 'llama3.2:3b')
  .option('-t, --type <type>', 'job type', 'generate')
  .option('-s, --score <number>', 'performance score')
  .option('-c, --category <category>', 'task category')
  .action(async (prompt: string, response: string, options) => {
    try {
      console.log(chalk.blue(`💾 Storing in cache: "${prompt.substring(0, 50)}..."`));

      let responseData: unknown;

      // Check if response is a JSON file
      if (response.endsWith('.json')) {
        try {
          responseData = JSON.parse(readFileSync(response, 'utf8'));
          console.log(chalk.gray(`Loaded response from file: ${response}`));
        } catch (fileError) {
          throw new Error(`Failed to read JSON file: ${fileError}`);
        }
      } else {
        // Try to parse as JSON, otherwise use as string
        try {
          responseData = JSON.parse(response);
        } catch {
          responseData = response;
        }
      }

      const performanceData = {
        ...(options.score && { score: parseFloat(options.score) }),
        ...(options.category && { taskCategory: options.category }),
        scoreSource: 'user-feedback' as const,
      };

      await storeInCache(
        prompt,
        responseData,
        options.model,
        options.type as JobType,
        performanceData,
      );

      console.log(chalk.green('✅ Successfully stored in cache'));
    } catch (error) {
      console.error(chalk.red('Error storing in cache:'), error);
      process.exit(1);
    }
  });
