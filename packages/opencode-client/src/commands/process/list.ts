import { Command } from 'commander';
import chalk from 'chalk';

export const listProcessesCommand = new Command('list')
  .description('List all running processes')
  .option('-a, --all', 'show all processes including inactive ones')
  .action(async (_options) => {
    try {
      console.log(chalk.blue('📋 Listing processes...'));
      // TODO: Implement process listing logic
      console.log(chalk.yellow('Process listing not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error listing processes:'), error);
      process.exit(1);
    }
  });
