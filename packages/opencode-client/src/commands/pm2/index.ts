import { Command } from 'commander';
import chalk from 'chalk';
import { listProcesses, describeProcess, showLogs, getPM2Status } from '../../actions/pm2/index.js';

export const pm2Command = new Command('pm2').description('PM2 process management').alias('p');

pm2Command
  .command('list')
  .description('List all PM2 processes')
  .action(async () => {
    try {
      const result = await listProcesses();
      console.log(result);
    } catch (error) {
      console.error(
        chalk.red('Error listing processes:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

pm2Command
  .command('describe <nameOrId>')
  .description('Get detailed process description')
  .action(async (nameOrId) => {
    try {
      const result = await describeProcess(nameOrId);
      console.log(result);
    } catch (error) {
      console.error(
        chalk.red('Error describing process:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

pm2Command
  .command('logs [nameOrId]')
  .description('Show logs for PM2 processes')
  .option('-l, --lines <number>', 'Number of lines to show', '100')
  .option('-t, --type <type>', 'Log type (out|error|combined)', 'combined')
  .action(async (nameOrId, options) => {
    try {
      const result = await showLogs(nameOrId, {
        lines: parseInt(options.lines),
        type: options.type,
      });
      console.log(result);
    } catch (error) {
      console.error(
        chalk.red('Error fetching logs:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

pm2Command
  .command('status')
  .description('Show PM2 daemon status')
  .action(async () => {
    try {
      const result = await getPM2Status();
      console.log(result);
    } catch (error) {
      console.error(
        chalk.red('Error getting status:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
