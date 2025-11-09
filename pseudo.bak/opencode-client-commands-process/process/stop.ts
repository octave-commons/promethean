import { Command } from 'commander';
import chalk from 'chalk';
import { stopProcess } from '../../actions/process/index.js';

export const stopProcessCommand = new Command('stop')
  .description('Stop a running process')
  .argument('<pid>', 'process ID to stop')
  .option('-f, --force', 'force stop the process')
  .option('-t, --timeout <ms>', 'timeout in milliseconds', '5000')
  .action(async (pid: string, options) => {
    try {
      const pidNum = parseInt(pid, 10);
      if (isNaN(pidNum)) {
        throw new Error('Invalid PID: must be a number');
      }

      console.log(chalk.blue(`🛑 Stopping process: ${pid}`));

      const result = await stopProcess({
        pid: pidNum,
        signal: options.force ? 'SIGKILL' : 'SIGTERM',
        timeoutMs: parseInt(options.timeout, 10),
      });

      console.log(chalk.green(result));
    } catch (error) {
      console.error(chalk.red('Error stopping process:'), error);
      process.exit(1);
    }
  });
