import { Command } from 'commander';
import chalk from 'chalk';
import { UnifiedAgentManager } from '../../api/UnifiedAgentManager.js';

export const listAgentsCommand = new Command('list')
  .description('List all agent sessions')
  .option(
    '-s, --status <status>',
    'filter by status (initializing, running, completed, failed, idle)',
  )
  .option('-j, --json', 'output in JSON format')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Listing agent sessions...'));

      const manager = UnifiedAgentManager.getInstance();
      let sessions = manager.listAgentSessions();

      // Filter by status if specified
      if (options.status) {
        sessions = manager.getSessionsByStatus(options.status as any);
      }

      // Sort by creation time (most recent first)
      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (options.json) {
        console.log(JSON.stringify(sessions, null, 2));
      } else {
        if (sessions.length === 0) {
          console.log(chalk.yellow('No agent sessions found'));
          return;
        }

        console.log(chalk.green(`Found ${sessions.length} agent sessions:`));
        sessions.forEach((session) => {
          const statusColor =
            {
              initializing: chalk.yellow,
              running: chalk.blue,
              completed: chalk.green,
              failed: chalk.red,
              idle: chalk.gray,
            }[session.status] || chalk.white;

          console.log(
            `\n${statusColor(`[${session.status.toUpperCase()}]`)} ${chalk.cyan(session.sessionId)}`,
          );
          console.log(`  Title: ${session.session.title || 'Untitled'}`);
          console.log(`  Created: ${new Date(session.createdAt).toLocaleString()}`);
          console.log(
            `  Task: ${session.task.task.substring(0, 100)}${session.task.task.length > 100 ? '...' : ''}`,
          );

          if (session.session.files && session.session.files.length > 0) {
            console.log(`  Files: ${session.session.files.join(', ')}`);
          }
        });
      }
    } catch (error) {
      console.error(chalk.red('Error listing agents:'), error);
      process.exit(1);
    }
  });
