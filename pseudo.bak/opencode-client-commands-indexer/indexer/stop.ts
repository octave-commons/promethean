import { Command } from 'commander';
import chalk from 'chalk';

/**
 * Stop the event indexer service
 */
export const stopIndexerCommand = new Command('stop')
  .description('Stop the event indexer service')
  .option('-f, --force', 'Force stop without graceful shutdown', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🛑 Stopping Event Indexer...'));

      if (options.force) {
        console.log(chalk.yellow('⚠️ Force stopping Event Indexer'));
        // In a real implementation, we would kill the process
        console.log(chalk.green('✅ Event Indexer force stopped'));
        process.exit(0);
      } else {
        // In a real implementation, we would send a signal to the running process
        console.log(chalk.yellow('⚠️ Graceful shutdown not implemented yet'));
        console.log(chalk.gray('Use --force to stop immediately'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to stop Event Indexer:'), error);
      process.exit(1);
    }
  });
