import { Command } from 'commander';
import chalk from 'chalk';

export const getSession = new Command('get')
  .description('Get details of a specific session')
  .argument('<sessionId>', 'Session ID to retrieve')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (sessionId, options) => {
    try {
      // Mock implementation
      const mockSession = {
        id: sessionId,
        title: 'Sample Session',
        messageCount: 25,
        lastActivityTime: new Date().toISOString(),
        activityStatus: 'active',
        isAgentTask: true,
        agentTaskStatus: 'running',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(mockSession, null, 2));
        return;
      }

      console.log(chalk.blue('Session Details:'));
      console.log(`ID: ${mockSession.id}`);
      console.log(`Title: ${mockSession.title}`);
      console.log(`Messages: ${mockSession.messageCount}`);
      console.log(`Status: ${mockSession.activityStatus}`);
      console.log(`Agent Task: ${mockSession.isAgentTask ? 'Yes' : 'No'}`);
      console.log(`Created: ${mockSession.createdAt}`);
      console.log(`Last Activity: ${mockSession.lastActivityTime}`);
    } catch (error) {
      console.error(chalk.red('Error getting session:'), error.message);
      process.exit(1);
    }
  });
