import { Command } from 'commander';
import chalk from 'chalk';

export const listAgentsCommand = new Command('list')
  .description('List all agents')
  .option('-s, --status <status>', 'filter by status')
  .action(async (_options) => {
    try {
      console.log(chalk.blue('📋 Listing agents...'));
      // TODO: Implement agent listing logic
      console.log(chalk.yellow('Agent listing not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error listing agents:'), error);
      process.exit(1);
    }
  });
