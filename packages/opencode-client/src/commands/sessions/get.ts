import { Command } from 'commander';
import chalk from 'chalk';
import { get } from '../../actions/sessions/get.js';

export const getSessionCommand = new Command('get')
  .description('Get details of a specific session')
  .argument('<sessionId>', 'Session ID to retrieve')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (sessionId, options) => {
    try {
      const result = await get({ sessionId });

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Handle error case
      if ('error' in result) {
        console.error(chalk.red('Error getting session:'), result.error);
        process.exit(1);
      }

      // Handle both formats: {session: {...}} or direct session object
      const session = result.session || (result as any);

      console.log(chalk.blue('Session Details:'));
      console.log(`ID: ${session.id}`);
      console.log(`Title: ${session.title || 'Untitled'}`);
      console.log(`Messages: ${session.messageCount || 0}`);
      console.log(`Status: ${session.activityStatus || 'unknown'}`);
      console.log(`Agent Task: ${session.isAgentTask ? 'Yes' : 'No'}`);
      console.log(`Created: ${session.createdAt || 'Unknown'}`);
      console.log(`Last Activity: ${session.lastActivityTime || 'Unknown'}`);

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(
        chalk.red('Error getting session:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
