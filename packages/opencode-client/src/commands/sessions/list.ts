import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { listSessions } from '../../api/sessions.js';

export const listCommand = new Command('list')
  .description('List all active sessions')
  .alias('ls')
  .option('-l, --limit <number>', 'Number of sessions to return', '20')
  .option('-o, --offset <number>', 'Number of sessions to skip', '0')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    try {
      const sessions = await listSessions({
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(sessions, null, 2));
        return;
      }

      console.log(chalk.blue('Active Sessions:'));
      const cliTable = new Table({
        head: ['ID', 'Title', 'Messages', 'Status', 'Agent Task'],
        chars: {
          top: '─',
          'top-mid': '┬',
          'top-left': '┌',
          'top-right': '┐',
          bottom: '─',
          'bottom-mid': '┴',
          'bottom-left': '└',
          'bottom-right': '┘',
          left: '│',
          'left-mid': '├',
          mid: '─',
          'mid-mid': '┼',
          right: '│',
          'right-mid': '┤',
          middle: '│',
        },
      });

      sessions.forEach((session) => {
        cliTable.push([
          session.id.substring(0, 12) + '...',
          session.title,
          session.messageCount.toString(),
          session.activityStatus,
          session.isAgentTask ? 'Yes' : 'No',
        ]);
      });

      console.log(cliTable.toString());
    } catch (error) {
      console.error(chalk.red('Error listing sessions:'), error.message);
      process.exit(1);
    }
  });
