import { Command } from 'commander';
import chalk from 'chalk';
import { AgentTaskManager } from '../../api/AgentTaskManager.js';

export const listTasksCommand = new Command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'filter by status (idle, running, completed, failed)')
  .option('-j, --json', 'output in JSON format')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Listing tasks...'));

      const allTasks = await AgentTaskManager.getAllTasks();
      let tasks = Array.from(allTasks.values());

      // Filter by status if specified
      if (options.status) {
        tasks = tasks.filter((task) => task.status === options.status);
      }

      // Sort by last activity (most recent first)
      tasks.sort((a, b) => b.lastActivity - a.lastActivity);

      if (options.json) {
        console.log(JSON.stringify(tasks, null, 2));
      } else {
        if (tasks.length === 0) {
          console.log(chalk.yellow('No tasks found'));
          return;
        }

        console.log(chalk.green(`Found ${tasks.length} tasks:`));
        tasks.forEach((task) => {
          const statusColor =
            {
              idle: chalk.gray,
              running: chalk.blue,
              completed: chalk.green,
              failed: chalk.red,
            }[task.status] || chalk.white;

          const lastActivity = new Date(task.lastActivity).toLocaleString();
          const taskPreview =
            task.task.length > 50 ? task.task.substring(0, 50) + '...' : task.task;

          console.log(
            `\n${statusColor(`[${task.status.toUpperCase()}]`)} ${chalk.cyan(task.sessionId)}`,
          );
          console.log(`  Task: ${taskPreview}`);
          console.log(`  Last activity: ${lastActivity}`);
          if (task.completionMessage) {
            console.log(`  Completion: ${task.completionMessage}`);
          }
        });
      }
    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error);
      process.exit(1);
    }
  });
