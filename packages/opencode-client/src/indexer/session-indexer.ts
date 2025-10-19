#!/usr/bin/env node

import chalk from 'chalk';
import { DualStoreManager } from '@promethean/persistence';
import { sessionStore, agentTaskStore, initializeStores } from '../index.js';

/**
 * Session Indexer Process
 *
 * This process runs continuously to:
 * 1. Index new sessions for searchability
 * 2. Update session statistics
 * 3. Clean up old/duplicate sessions
 * 4. Maintain session metadata
 */

class SessionIndexer {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private sessionStore: DualStoreManager<'text', 'timestamp'>;
  private agentTaskStore: DualStoreManager<'text', 'timestamp'>;

  constructor() {
    this.sessionStore = sessionStore;
    this.agentTaskStore = agentTaskStore;
  }

  async start() {
    if (this.isRunning) {
      console.log(chalk.yellow('Session indexer is already running'));
      return;
    }

    console.log(chalk.blue('🚀 Starting Session Indexer...'));

    // Initialize stores
    await this.initializeStores();

    this.isRunning = true;

    // Run initial indexing
    await this.runIndexing();

    // Schedule regular indexing every 30 seconds
    this.interval = setInterval(async () => {
      if (this.isRunning) {
        await this.runIndexing();
      }
    }, 30000);

    console.log(chalk.green('✅ Session Indexer started successfully'));
    console.log(chalk.gray('📊 Indexing runs every 30 seconds'));
  }

  async stop() {
    if (!this.isRunning) {
      console.log(chalk.yellow('Session indexer is not running'));
      return;
    }

    console.log(chalk.blue('🛑 Stopping Session Indexer...'));

    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Cleanup database connections
    await this.cleanupConnections();

    console.log(chalk.green('✅ Session Indexer stopped'));
  }

  private async initializeStores() {
    try {
      if (!this.sessionStore) {
        this.sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
      }
      if (!this.agentTaskStore) {
        this.agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');
      }

      initializeStores(this.sessionStore, this.agentTaskStore);

      console.log(chalk.gray('📦 Stores initialized'));
    } catch (error) {
      console.error(chalk.red('Failed to initialize stores:'), error);
      throw error;
    }
  }

  private async runIndexing() {
    try {
      const startTime = Date.now();

      // Get all sessions that need indexing
      const sessions = await this.sessionStore.getMostRecent(1000);

      // Process each session
      let indexedCount = 0;
      let updatedCount = 0;

      for (const session of sessions) {
        try {
          // Ensure session has proper metadata
          const currentMetadata = session.metadata || {};

          // Get current values
          const currentMessageCount = currentMetadata.messageCount || 0;
          const currentLastActivity = currentMetadata.lastActivityTime || session.timestamp;

          // Create updated metadata with indexing timestamp
          const updatedMetadata: any = {
            ...currentMetadata,
            messageCount: currentMessageCount,
            lastActivityTime: currentLastActivity,
            indexedAt: new Date().toISOString(),
          };

          // Check if metadata needs updating
          const needsUpdate = !currentMetadata.indexedAt;

          if (needsUpdate) {
            // Re-insert with updated metadata
            await this.sessionStore.insert({
              id: session.id,
              text: session.text,
              metadata: updatedMetadata,
              timestamp: session.timestamp,
            });

            updatedCount++;
          }

          indexedCount++;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to index session ${session.id}:`), error);
        }
      }

      const duration = Date.now() - startTime;

      if (process.env.OPENCODE_DEBUG || indexedCount > 0) {
        console.log(
          chalk.gray(
            `📊 Indexed ${indexedCount} sessions, updated ${updatedCount} in ${duration}ms`,
          ),
        );
      }
    } catch (error) {
      console.error(chalk.red('Error during indexing:'), error);
    }
  }

  private async cleanupConnections() {
    try {
      if (this.sessionStore && typeof this.sessionStore.cleanup === 'function') {
        await this.sessionStore.cleanup();
      }
      if (this.agentTaskStore && typeof this.agentTaskStore.cleanup === 'function') {
        await this.agentTaskStore.cleanup();
      }

      // Also close the global MongoDB client
      const { getMongoClient } = await import('@promethean/persistence');
      const mongoClient = await getMongoClient();
      await mongoClient.close();

      console.log(chalk.gray('🧹 Database connections closed'));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Failed to cleanup connections:'), error);
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const indexer = new SessionIndexer();

  switch (command) {
    case 'start':
      await indexer.start();

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log(chalk.gray('\\nReceived SIGINT, shutting down gracefully...'));
        await indexer.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        console.log(chalk.gray('\\nReceived SIGTERM, shutting down gracefully...'));
        await indexer.stop();
        process.exit(0);
      });

      // Keep the process running
      process.stdin.resume();
      break;

    case 'stop':
      await indexer.stop();
      break;

    case 'status':
      console.log(chalk.blue('Session Indexer Status:'));
      console.log(chalk.gray('Run with "start" to begin indexing'));
      break;

    default:
      console.log(chalk.blue('Session Indexer CLI'));
      console.log('');
      console.log('Usage:');
      console.log('  node dist/indexer/session-indexer.js start   - Start the indexer');
      console.log('  node dist/indexer/session-indexer.js stop    - Stop the indexer');
      console.log('  node dist/indexer/session-indexer.js status  - Show status');
      console.log('');
      console.log('PM2 Usage:');
      console.log('  pm2 start dist/indexer/session-indexer.js --name session-indexer -- start');
      console.log('  pm2 stop session-indexer');
      console.log('  pm2 logs session-indexer');
      console.log('  pm2 status session-indexer');
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { SessionIndexer };
