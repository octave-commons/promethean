import { Command } from 'commander';
import chalk from 'chalk';
import { listSessions } from '../../api/sessions.js';

export const getSessionCommand = new Command('get')
  .description('Get details of a specific session')
  .argument('<sessionId>', 'Session ID to retrieve')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (sessionId, options) => {
    try {
      // Workaround: Use list API to find session since get API is broken
      const sessions = await listSessions({ limit: 1000 }); // Get a large list
      const session = sessions.find((s) => s.id === sessionId);

      if (!session) {
        console.error(chalk.red(`Session not found: ${sessionId}`));
        process.exit(1);
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(session, null, 2));
        return;
      }

      console.log(chalk.blue('Session Details:'));
      console.log(`ID: ${session.id}`);
      console.log(`Title: ${session.title || 'Untitled'}`);
      console.log(`Messages: ${session.messageCount || 0}`);
      console.log(`Status: ${session.activityStatus || 'unknown'}`);
      console.log(`Agent Task: ${session.isAgentTask ? 'Yes' : 'No'}`);
      console.log(`Created: ${session.createdAt || 'Unknown'}`);
      console.log(`Last Activity: ${session.lastActivityTime || 'Unknown'}`);
    } catch (error) {
      console.error(
        chalk.red('Error getting session:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
