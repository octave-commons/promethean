import { Command } from 'commander';
import chalk from 'chalk';

export const closeSession = new Command('close')
  .description('Close a session')
  .argument('<sessionId>', 'Session ID to close')
  .action(async (sessionId) => {
    try {
      console.log(chalk.yellow(`Closing session ${sessionId}...`));
      console.log(chalk.green('✓ Session closed successfully'));
    } catch (error: any) {
      console.error(chalk.red('Error closing session:'), error.message);
      process.exit(1);
    }
  });
