import { Command } from 'commander';
import chalk from 'chalk';

export const indexerCommands = new Command('indexer').description(
  'Manage OpenCode indexer service for active data capture',
);

// Start indexer command
indexerCommands
  .command('start')
  .description('Start the indexer service to actively capture events and messages')
  .action(async () => {
    try {
      console.log(chalk.blue('🚀 Starting OpenCode indexer service...'));

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
      console.log(chalk.blue('📊 Checking indexer service status...'));

      // For now, just show basic info
      // In a real implementation, you might check if the process is running
      console.log(chalk.green('✅ Indexer service commands are available'));
      console.log(chalk.gray('Use "indexer start" to begin active indexing'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to check indexer status:'), error);
      process.exit(1);
    }
  });
