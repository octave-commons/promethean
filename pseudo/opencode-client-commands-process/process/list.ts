import { Command } from 'commander';
import chalk from 'chalk';
import { listProcesses, getProcessList } from '../../actions/process/index.js';

export const listProcessesCommand = new Command('list')
  .description('List all running processes')
  .option('-a, --all', 'show all processes including inactive ones')
  .option('-j, --json', 'output in JSON format')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Listing processes...'));

      if (options.json) {
        const processes = await getProcessList();
        console.log(JSON.stringify(processes, null, 2));
      } else {
        const result = await listProcesses();
        console.log(result);
      }
    } catch (error) {
      console.error(chalk.red('Error listing processes:'), error);
      process.exit(1);
    }
  });
