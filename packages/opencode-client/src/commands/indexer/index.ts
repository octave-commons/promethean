import { Command } from 'commander';
import chalk from 'chalk';

export const indexerCommands = new Command('indexer').description(
  'Manage OpenCode indexer service for active data capture',
);

// Start indexer command
indexerCommands
  .command('start')
  .description('Start the indexer service to actively capture events and messages')
  .option('--pm2', 'Run as PM2 daemon instead of foreground process')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    try {
      // Add options to process.argv for the command to pick up
      if (options.pm2) process.argv.push('--pm2');
      if (options.verbose) process.argv.push('--verbose');

      // Dynamic import to avoid circular dependencies
      const { main } = await import('./start.js');
      await main();
    } catch (error) {
      console.error(chalk.red('❌ Failed to start indexer service:'), error);
      process.exit(1);
    }
  });

// Stop indexer command
indexerCommands
  .command('stop')
  .description('Stop the indexer service')
  .action(async () => {
    try {
      console.log(chalk.blue('🛑 Stopping OpenCode indexer service...'));

      // Dynamic import to avoid circular dependencies
      const { main } = await import('./stop.js');
      await main();
    } catch (error) {
      console.error(chalk.red('❌ Failed to stop indexer service:'), error);
      process.exit(1);
    }
  });

// Status command
indexerCommands
  .command('status')
  .description('Check the status of the indexer service')
  .action(async () => {
    try {
      // Dynamic import to avoid circular dependencies
      const { main } = await import('./status.js');
      await main();
    } catch (error) {
      console.error(chalk.red('❌ Failed to check indexer status:'), error);
      process.exit(1);
    }
  });
