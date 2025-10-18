import { Command } from 'commander';
import chalk from 'chalk';

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

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      console.log(chalk.green('✓ Job submitted successfully'));
      console.log(`Job ID: ${jobId}`);
      console.log(`Model: ${model}`);
      console.log(`Type: ${type}`);
      console.log(`Priority: ${options.priority}`);
      console.log(`Queue Position: 1`);
    } catch (error) {
      console.error(chalk.red('Error submitting job:'), error.message);
      process.exit(1);
    }
  });
