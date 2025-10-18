import { Command } from 'commander';
import chalk from 'chalk';
import { UnifiedAgentManager } from '../../api/UnifiedAgentManager.js';

export const getAgentCommand = new Command('get')
  .description('Get agent session details')
  .argument('<sessionId>', 'session ID to retrieve')
  .option('-j, --json', 'output in JSON format')
  .action(async (sessionId: string, options) => {
    try {
      console.log(chalk.blue(`📖 Getting agent session: ${sessionId}`));

      const manager = UnifiedAgentManager.getInstance();
      const session = manager.getAgentSession(sessionId);

      if (!session) {
        console.log(chalk.yellow(`No agent session found: ${sessionId}`));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(session, null, 2));
      } else {
        const statusColor =
          {
            initializing: chalk.yellow,
            running: chalk.blue,
            completed: chalk.green,
            failed: chalk.red,
            idle: chalk.gray,
          }[session.status] || chalk.white;

        console.log(chalk.green(`Agent Session Details:`));
        console.log(`Session ID: ${chalk.cyan(session.sessionId)}`);
        console.log(`Status: ${statusColor(session.status.toUpperCase())}`);
        console.log(`Title: ${session.session.title || 'Untitled'}`);
        console.log(`Task: ${session.task.task}`);
        console.log(`Created: ${new Date(session.createdAt).toLocaleString()}`);
        console.log(`Task Status: ${session.task.status.toUpperCase()}`);
        console.log(`Task Started: ${new Date(session.task.startTime).toLocaleString()}`);
        console.log(`Last Activity: ${new Date(session.task.lastActivity).toLocaleString()}`);

        if (session.session.files && session.session.files.length > 0) {
          console.log(`Files: ${session.session.files.join(', ')}`);
        }

        if (session.session.delegates && session.session.delegates.length > 0) {
          console.log(`Delegates: ${session.session.delegates.join(', ')}`);
        }

        if (session.task.completionMessage) {
          console.log(`Completion Message: ${session.task.completionMessage}`);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error getting agent:'), error);
      process.exit(1);
    }
  });
