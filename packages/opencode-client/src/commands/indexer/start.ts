import { Command } from 'commander';
import chalk from 'chalk';
import { EventWatcherService } from '../../services/EventWatcherService.js';
import { sessionStore, agentTaskStore } from '../../index.js';

/**
 * Start the event indexer service
 */
export const startIndexerCommand = new Command('start')
  .description('Start the event indexer service')
  .option('-f, --foreground', 'Run in foreground (default: background)', false)
  .option('-i, --interval <number>', 'Indexing interval in milliseconds', '5000')
  .option('-b, --batch-size <number>', 'Event batch size', '100')
  .option('-r, --retroactive', 'Enable retroactive indexing of existing data', true)
  .option('--no-retroactive', 'Disable retroactive indexing')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Starting Event Indexer...'));

      // Initialize stores
      if (!sessionStore || !agentTaskStore) {
        console.error(chalk.red('❌ Stores not initialized. Run with proper store setup.'));
        process.exit(1);
      }

      // Create event watcher service
      const eventWatcher = new EventWatcherService({
        indexingInterval: parseInt(options.interval),
        batchSize: parseInt(options.batchSize),
        enableRetrospective: options.retroactive,
        verbose: options.verbose,
      });

      // Start the service
      await eventWatcher.start();

      if (options.foreground) {
        console.log(chalk.green('✅ Event Indexer running in foreground'));
        console.log(chalk.gray('Press Ctrl+C to stop'));

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
          console.log(chalk.gray('\n🛑 Shutting down Event Indexer...'));
          await eventWatcher.stop();
          process.exit(0);
        });

        process.on('SIGTERM', async () => {
          console.log(chalk.gray('\n🛑 Terminating Event Indexer...'));
          await eventWatcher.stop();
          process.exit(0);
        });

        // Keep process running
        process.stdin.resume();
      } else {
        console.log(chalk.green('✅ Event Indexer started in background'));
        console.log(chalk.gray('Use "agent-cli indexer stop" to stop'));
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to start Event Indexer:'), error);
      process.exit(1);
    }
  });
