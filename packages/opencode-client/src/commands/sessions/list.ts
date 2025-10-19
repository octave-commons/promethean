import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { listSessions } from '../../api/sessions.js';
import { list as listAction } from '../../actions/sessions/list.js';

export const listCommand = new Command('list')
  .description('List all active sessions')
  .alias('ls')
  .option('-l, --limit <number>', 'Number of sessions to return', '20')
  .option('-o, --offset <number>', 'Number of sessions to skip', '0')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    try {
      const limit = parseInt(options.limit);
      const offset = parseInt(options.offset);

      // Try API first, fallback to direct action if server is unavailable
      let sessions: any[] = [];
      let sessionsFromApi = false;
      try {
        sessions = await listSessions({
          limit,
          offset,
        });
        sessionsFromApi = true;
        // If API returns more sessions than requested, fallback to local action
        if (sessions.length > limit) {
          console.log(chalk.yellow('API not respecting limit, using local action...'));
          const result = await listAction({
            limit,
            offset,
          });
          const parsed = JSON.parse(result);
          sessions = parsed.sessions || [];
          sessionsFromApi = false;
        }
      } catch (serverError) {
        console.log(
          chalk.yellow('Server unavailable, using local action...'),
          (serverError as Error).message,
        );
        const result = await listAction({
          limit,
          offset,
        });
        const parsed = JSON.parse(result);
        sessions = parsed.sessions || [];
        sessionsFromApi = false;
      }

      if (sessionsFromApi) {
        try {
          const localLimit = Math.min(limit + offset + 50, 500);
          const result = await listAction({
            limit: localLimit,
            offset: 0,
          });
          const parsed = JSON.parse(result);
          const localSessions: any[] = parsed.sessions || [];
          const localById = new Map<string, any>();
          localSessions.forEach((session: any) => {
            if (!session?.id) return;
            localById.set(session.id, session);
            if (session.id.length >= 12) {
              localById.set(session.id.substring(0, 12), session);
            }
          });

          sessions = sessions.map((session: any) => {
            const prefixKey = session?.id ? session.id.substring(0, 12) : undefined;
            const local =
              localById.get(session.id) || (prefixKey ? localById.get(prefixKey) : undefined);
            if (!local) return session;

            const isAgentTask =
              local.isAgentTask === true || session.isAgentTask === true
                ? true
                : (session.isAgentTask ?? local.isAgentTask);

            return {
              ...session,
              messageCount: local.messageCount ?? session.messageCount,
              activityStatus: local.activityStatus ?? session.activityStatus,
              isAgentTask: isAgentTask ?? false,
              agentTaskStatus: local.agentTaskStatus ?? session.agentTaskStatus,
            };
          });
        } catch (mergeError) {
          console.log(
            chalk.yellow('Unable to enrich sessions with local metadata:'),
            (mergeError as Error).message,
          );
        }
      }

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

      sessions.forEach((session: any) => {
        cliTable.push([
          session.id.substring(0, 12) + '...',
          session.title,
          (session.messageCount || 0).toString(),
          session.activityStatus,
          session.isAgentTask ? 'Yes' : 'No',
        ]);
      });

      console.log(cliTable.toString());

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(
        chalk.red('Error listing sessions:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
