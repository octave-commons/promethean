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
  .option('--baseUrl <url>', 'OpenCode server base URL', 'http://localhost:4096')
  .action(async (options) => {
    try {
      // Add options to process.argv for the command to pick up
      if (options.verbose) process.argv.push('--verbose');

      // Dynamic import to avoid circular dependencies
      const { main } = await import('./start.js');
      await main();
    } catch (error) {
      console.error(chalk.red('❌ Failed to start indexer service:'), error);
      process.exit(1);
    }
  });
