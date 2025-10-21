import { Command } from 'commander';
import chalk from 'chalk';
import { submitJob } from '../../api/ollama.js';
import type { SubmitJobOptions } from '../../api/ollama.js';

export const submitJobCommand = new Command('submit')
  .description('Submit a new LLM job to the queue')
  .argument('<model>', 'Ollama model name to use')
  .argument('<type>', 'Job type (generate|chat|embedding)')
  .option('-p, --prompt <text>', 'Prompt for generate jobs')
  .option('-n, --name <name>', 'Optional name for the job')
  .option('--priority <priority>', 'Job priority (low|medium|high|urgent)', 'medium')
  .action(async (model, type, options) => {
    try {
      // Validate job type
      const validTypes = ['generate', 'chat', 'embedding'];
      if (!validTypes.includes(type)) {
        console.error(chalk.red(`Invalid job type: ${type}`));
        console.log(chalk.yellow(`Valid types: ${validTypes.join(', ')}`));
        process.exit(1);
      }

      // Validate priority
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(options.priority)) {
        console.error(chalk.red(`Invalid priority: ${options.priority}`));
        console.log(chalk.yellow(`Valid priorities: ${validPriorities.join(', ')}`));
        process.exit(1);
      }

      // Prepare job options
      const jobOptions: SubmitJobOptions = {
        modelName: model,
        jobType: type as 'generate' | 'chat' | 'embedding',
        priority: options.priority as 'low' | 'medium' | 'high' | 'urgent',
        jobName: options.name,
      };

      // Add prompt or messages based on job type
      if (type === 'generate') {
        if (!options.prompt) {
          console.error(chalk.red('Generate jobs require a prompt (--prompt)'));
          process.exit(1);
        }
        jobOptions.prompt = options.prompt;
      } else if (type === 'chat') {
        if (!options.prompt) {
          console.error(chalk.red('Chat jobs require a prompt (--prompt)'));
          process.exit(1);
        }
        // For chat jobs, convert prompt to a single message
        jobOptions.messages = [{ role: 'user', content: options.prompt }];
      } else if (type === 'embedding') {
        if (!options.prompt) {
          console.error(chalk.red('Embedding jobs require input text (--prompt)'));
          process.exit(1);
        }
        jobOptions.input = options.prompt;
      }

      // Submit the job
      const result = await submitJob(jobOptions);

      console.log(chalk.green('✓ Job submitted successfully'));
      console.log(`Job ID: ${result.id}`);
      console.log(`Model: ${model}`);
      console.log(`Type: ${type}`);
      console.log(`Priority: ${options.priority}`);
      console.log(`Queue Position: ${(result as any).queuePosition || 'N/A'}`);

      // Explicit process exit to prevent hanging
      process.exit(0);
    } catch (error: any) {
      console.error(chalk.red('Error submitting job:'), error.message);
      process.exit(1);
    }
  });
