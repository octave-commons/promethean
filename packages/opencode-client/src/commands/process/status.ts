import { Command } from 'commander';
import chalk from 'chalk';
import { checkProcessStatus } from '../../actions/process/index.js';

export const getProcessStatusCommand = new Command('status')
  .description('Get status of a process')
  .argument('<pid>', 'process ID to check')
  .action(async (pid: string) => {
    try {
      const pidNum = parseInt(pid, 10);
      if (isNaN(pidNum)) {
        throw new Error('Invalid PID: must be a number');
      }

      console.log(chalk.blue(`📊 Checking process status: ${pid}`));

      const result = await checkProcessStatus({ pid: pidNum });
      console.log(chalk.green(result));
    } catch (error) {
      console.error(chalk.red('Error checking process status:'), error);
      process.exit(1);
    }
  });
