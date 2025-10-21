import { Command } from 'commander';
import chalk from 'chalk';
import { AgentTaskManager } from '../../api/AgentTaskManager.js';

export const getTaskCommand = new Command('get')
  .description('Get task details')
  .argument('<sessionId>', 'session ID to retrieve task for')
  .option('-j, --json', 'output in JSON format')
  .action(async (sessionId: string, options) => {
    try {
      console.log(chalk.blue(`📖 Getting task for session: ${sessionId}`));

      const allTasks = await AgentTaskManager.getAllTasks();
      const task = allTasks.get(sessionId);

      if (!task) {
        console.log(chalk.yellow(`No task found for session: ${sessionId}`));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(task, null, 2));
      } else {
        const statusColor =
          {
            idle: chalk.gray,
            running: chalk.blue,
            completed: chalk.green,
            failed: chalk.red,
          }[task.status] || chalk.white;

        console.log(chalk.green(`Task Details:`));
        console.log(`Session ID: ${chalk.cyan(task.sessionId)}`);
        console.log(`Status: ${statusColor(task.status.toUpperCase())}`);
        console.log(`Task: ${task.task}`);
        console.log(`Created: ${new Date(task.startTime).toLocaleString()}`);
        console.log(`Last Activity: ${new Date(task.lastActivity).toLocaleString()}`);

        if (task.completionMessage) {
          console.log(`Completion Message: ${task.completionMessage}`);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error getting task:'), error);
      process.exit(1);
    }
  });
