/**
 * Centralized cleanup utility for CLI commands
 * Ensures proper cleanup of resources before process exit
 */

import chalk from 'chalk';
import { cleanupStores } from '../cli.js';

let isCleaningUp = false;

/**
 * Perform centralized cleanup and exit with specified code
 * @param code Exit code (0 for success, 1 for error)
 * @param message Optional message to display
 */
export async function cleanupAndExit(code: number, message?: string): Promise<never> {
  if (isCleaningUp) {
    // Prevent infinite recursion if cleanup is already in progress
    process.exit(code);
  }

  isCleaningUp = true;

  try {
    if (message) {
      if (code === 0) {
        console.log(chalk.green(message));
      } else {
        console.error(chalk.red(message));
      }
    }

    // Perform centralized cleanup
    await cleanupStores();

    // Force exit after a short timeout to ensure cleanup completes
    setTimeout(() => {
      process.exit(code);
    }, 100);
  } catch (error) {
    console.error(chalk.yellow('Warning: Cleanup failed:'), error);
    process.exit(code);
  }

  // This should never be reached due to the timeout above
  process.exit(code);
}

/**
 * Wrapper for command actions that ensures proper cleanup
 * @param action The async action to execute
 * @param successMessage Optional success message
 * @param errorMessage Optional error message prefix
 */
export function withCleanup<T>(
  action: () => Promise<T>,
  successMessage?: string,
  errorMessage?: string,
): () => Promise<void> {
  return async () => {
    try {
      await action();
      await cleanupAndExit(0, successMessage);
    } catch (error) {
      const message = errorMessage || 'Command failed';
      console.error(
        chalk.red(`${message}:`),
        error instanceof Error ? error.message : String(error),
      );
      await cleanupAndExit(1);
    }
  };
}

/**
 * Initialize global cleanup handlers
 * Should be called once at application startup
 */
export function initializeGlobalCleanup(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error(chalk.red('Unexpected error:'), error.message);
    if (process.env.OPENCODE_DEBUG) {
      console.error(error.stack);
    }
    await cleanupAndExit(1);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error(chalk.red('Unhandled rejection at:'), promise, 'reason:', reason);
    await cleanupAndExit(1);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log(chalk.gray('\nShutting down...'));
    await cleanupAndExit(0);
  });

  // Handle SIGTERM
  process.on('SIGTERM', async () => {
    console.log(chalk.gray('\nTerminating...'));
    await cleanupAndExit(0);
  });
}
