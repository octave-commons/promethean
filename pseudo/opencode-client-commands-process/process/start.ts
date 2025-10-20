import { Command } from 'commander';
import chalk from 'chalk';
import { startProcess } from '../../actions/process/index.js';

export const startProcessCommand = new Command('start')
  .description('Start a new process')
  .argument('<command>', 'command to execute')
  .argument('[args...]', 'arguments for the command')
  .option('-d, --daemon', 'run as daemon process')
  .option('-c, --cwd <path>', 'working directory for the process', process.cwd())
  .action(async (command: string, args: string[], options) => {
    try {
      console.log(chalk.blue(`🚀 Starting process: ${command}`));
      if (args.length > 0) {
        console.log(chalk.gray(`Arguments: ${args.join(' ')}`));
      }
      console.log(chalk.gray(`Working directory: ${options.cwd}`));

      const result = await startProcess({
        command,
        args,
        cwd: options.cwd,
      });

      console.log(chalk.green(result));
    } catch (error) {
      console.error(chalk.red('Error starting process:'), error);
      process.exit(1);
    }
  });
