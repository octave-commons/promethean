import { Command } from 'commander';
import chalk from 'chalk';
import { getSession } from '../../api/sessions.js';

export const getSessionCommand = new Command('get')
  .description('Get details of a specific session')
  .argument('<sessionId>', 'Session ID to retrieve')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (sessionId, options) => {
    try {
      const session = await getSession(sessionId);

      if (options.format === 'json') {
        console.log(JSON.stringify(session, null, 2));
        return;
      }

      console.log(chalk.blue('Session Details:'));
      console.log(`ID: ${session.id}`);
      console.log(`Title: ${session.title}`);
      console.log(`Messages: ${session.messageCount}`);
      console.log(`Status: ${session.activityStatus}`);
      console.log(`Agent Task: ${session.isAgentTask ? 'Yes' : 'No'}`);
      console.log(`Created: ${session.createdAt}`);
      console.log(`Last Activity: ${session.lastActivityTime}`);
    } catch (error) {
      console.error(chalk.red('Error getting session:'), error.message);
      process.exit(1);
    }
  });
