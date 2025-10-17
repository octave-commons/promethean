import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';

export const listSessions = new Command('list')
  .description('List all active sessions')
  .alias('ls')
  .option('-l, --limit <number>', 'Number of sessions to return', '20')
  .option('-o, --offset <number>', 'Number of sessions to skip', '0')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    try {
      // Mock data for now - will integrate with actual session API
      const mockSessions = [
        {
          id: 'sess_1234567890',
          title: 'Code Review Session',
          messageCount: 15,
          lastActivityTime: new Date().toISOString(),
          activityStatus: 'active',
          isAgentTask: true,
          agentTaskStatus: 'running',
        },
        {
          id: 'sess_0987654321',
          title: 'Documentation Generation',
          messageCount: 8,
          lastActivityTime: new Date(Date.now() - 300000).toISOString(),
          activityStatus: 'waiting_for_input',
          isAgentTask: false,
        },
      ];

      if (options.format === 'json') {
        console.log(JSON.stringify(mockSessions, null, 2));
        return;
      }

      const data = [
        ['ID', 'Title', 'Messages', 'Status', 'Agent Task'],
        ...mockSessions.map((session) => [
          session.id.substring(0, 12) + '...',
          session.title,
          session.messageCount.toString(),
          session.activityStatus,
          session.isAgentTask ? 'Yes' : 'No',
        ]),
      ];

      console.log(chalk.blue('Active Sessions:'));
      console.log(
        table(data, {
          border: {
            topBody: '─',
            topJoin: '┬',
            topLeft: '┌',
            topRight: '┐',
            bottomBody: '─',
            bottomJoin: '┴',
            bottomLeft: '└',
            bottomRight: '┘',
            bodyLeft: '│',
            bodyRight: '│',
            bodyJoin: '│',
            joinBody: '─',
            joinLeft: '├',
            joinRight: '┤',
            joinJoin: '┼',
          },
        }),
      );
    } catch (error) {
      console.error(chalk.red('Error listing sessions:'), error.message);
      process.exit(1);
    }
  });
