import { Command } from 'commander';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { AgentTaskManager } from '../../api/AgentTaskManager.js';

export const createTaskCommand = new Command('create')
  .description('Create a new task')
  .argument('<description>', 'task description')
  .option('-s, --session-id <sessionId>', 'session ID (auto-generated if not provided)')
  .option('-j, --json', 'output in JSON format')
  .action(async (description: string, options) => {
    try {
      console.log(chalk.blue(`➕ Creating task: ${description}`));

      const sessionId = options.sessionId || randomUUID();
      const task = await AgentTaskManager.createTask(sessionId, description);

      if (options.json) {
        console.log(JSON.stringify(task, null, 2));
      } else {
        console.log(chalk.green(`✅ Task created successfully!`));
        console.log(`Session ID: ${chalk.cyan(task.sessionId)}`);
        console.log(`Status: ${chalk.blue(task.status.toUpperCase())}`);
        console.log(`Task: ${task.task}`);
        console.log(`Created: ${new Date(task.startTime).toLocaleString()}`);
      }
    } catch (error) {
      console.error(chalk.red('Error creating task:'), error);
      process.exit(1);
    }
  });
