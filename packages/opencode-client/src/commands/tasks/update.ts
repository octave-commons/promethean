import { Command } from 'commander';
import chalk from 'chalk';
import { AgentTaskManager } from '../../api/AgentTaskManager.js';

export const updateTaskCommand = new Command('update')
  .description('Update task status')
  .argument('<sessionId>', 'session ID to update')
  .argument('<status>', 'new status (idle, running, completed, failed)')
  .option('-m, --message <message>', 'completion or failure message')
  .action(async (sessionId: string, status: string, options) => {
    try {
      const validStatuses = ['idle', 'running', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Valid options: ${validStatuses.join(', ')}`);
      }

      console.log(chalk.blue(`🔄 Updating task ${sessionId} to status: ${status}`));

      await AgentTaskManager.updateTaskStatus(sessionId, status as any, options.message);

      console.log(chalk.green(`✅ Task status updated successfully!`));
      console.log(`Session ID: ${chalk.cyan(sessionId)}`);
      console.log(`New Status: ${chalk.blue(status.toUpperCase())}`);

      if (options.message) {
        console.log(`Message: ${options.message}`);
      }
    } catch (error) {
      console.error(chalk.red('Error updating task:'), error);
      process.exit(1);
    }
  });
