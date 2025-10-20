#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { sessionCommands } from './commands/sessions/index.js';
import { ollamaCommands } from './commands/ollama/index.js';
import { pm2Command } from './commands/pm2/index.js';
import { eventCommands } from './commands/events/index.js';
import { processCommands } from './commands/process/index.js';
import { cacheCommands } from './commands/cache/index.js';
import { tasksCommands } from './commands/tasks/index.js';
import { messagesCommands } from './commands/messages/index.js';
import { agentCommands as legacyAgentCommands } from './commands/agents/index.js';
import { indexerCommands } from './commands/indexer/index.js';
import { initializeStores } from './index.js';
import { DualStoreManager } from '@promethean/persistence';
import type { DualStoreManager as DualStoreManagerType } from './types/index.js';
// Agent management functions - these will be implemented as simple functions
async function createAgentSession(
  _task: string,
  _message?: string,
  _options?: Record<string, unknown>,
  _config?: Record<string, unknown>,
): Promise<{ sessionId: string; status: string; createdAt: Date }> {
  return {
    sessionId: `session-${Date.now()}`,
    status: 'created',
    createdAt: new Date(),
  };
}

async function startAgentSession(
  _sessionId: string,
  _options?: Record<string, unknown>,
): Promise<void> {
  console.log('Starting agent session');
}

async function stopAgentSession(_sessionId: string, _reason?: string): Promise<void> {
  console.log('Stopping agent session');
}

async function sendMessageToAgent(
  _sessionId: string,
  _message: string,
  _options?: Record<string, unknown>,
): Promise<void> {
  console.log('Sending message to agent');
}

async function closeAgentSession(_sessionId: string): Promise<void> {
  console.log('Closing agent session');
}

interface AgentSession {
  sessionId: string;
  status: string;
  createdAt: Date;
  lastActivity?: Date;
}

const unifiedAgentManager = {
  createAgentSession,
  startAgentSession,
  stopAgentSession,
  sendMessageToAgent,
  closeAgentSession,
  listAgentSessions: async (): Promise<AgentSession[]> => [],
  getAgentSession: async (_sessionId: string): Promise<AgentSession | null> => null,
  getSessionStats: async () => ({
    total: 0,
    active: 0,
    idle: 0,
    averageAge: 0,
    byStatus: { active: 0, idle: 0, completed: 0, failed: 0 },
  }),
  cleanupOldSessions: async (_maxAge?: number) => ({ cleaned: 0 }),
};
const version = '1.0.0';

// Initialize dual stores for CLI use
let storesInitialized = false;
let initPromise: Promise<void> | null = null;
let sessionStore: DualStoreManagerType<'text', 'timestamp'> | null = null;
let agentTaskStore: DualStoreManagerType<'text', 'timestamp'> | null = null;

async function initializeCliStores() {
  if (storesInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
      agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');

      await initializeStores();
      storesInitialized = true;

      if (process.env.OPENCODE_DEBUG) {
        console.log(chalk.gray('CLI stores initialized'));
      }
    } catch (error) {
      console.warn(chalk.yellow('Warning: Failed to initialize CLI stores:', error));
    }
  })();

  return initPromise;
}

export async function cleanupStores() {
  try {
    // Close store connections
    if (sessionStore && typeof sessionStore.cleanup === 'function') {
      await sessionStore.cleanup();
    }
    if (agentTaskStore && typeof agentTaskStore.cleanup === 'function') {
      await agentTaskStore.cleanup();
    }

    // Reset the initialized flag so stores can be recreated if needed
    storesInitialized = false;
    initPromise = null;
    sessionStore = null;
    agentTaskStore = null;

    if (process.env.OPENCODE_DEBUG) {
      console.log(chalk.gray('CLI stores cleaned up'));
    }
  } catch (error) {
    // Ignore cleanup errors
    if (process.env.OPENCODE_DEBUG) {
      console.log(chalk.yellow('Warning: Failed to cleanup stores:', error));
    }
  }
}

const program = new Command();

program
  .name('opencode-client')
  .description('CLI client for OpenCode plugins and tools')
  .version(version);

// Global options
program
  .option('-v, --verbose', 'verbose output')
  .option('--no-color', 'disable colored output')
  .hook('preAction', async (thisCommand) => {
    // Initialize stores before any command runs
    await initializeCliStores();

    const options = thisCommand.opts();
    if (options.verbose) {
      console.log(chalk.gray('Verbose mode enabled'));
    }
  })
  .hook('postAction', async () => {
    // Cleanup stores after command completes
    await cleanupStores();
  });

// Add command groups
program.addCommand(sessionCommands);
program.addCommand(ollamaCommands);
program.addCommand(pm2Command);
program.addCommand(eventCommands);
program.addCommand(processCommands);
program.addCommand(cacheCommands);
program.addCommand(tasksCommands);
program.addCommand(messagesCommands);
program.addCommand(legacyAgentCommands);
program.addCommand(indexerCommands);

// Add unified agent management commands


program.addCommand(unifiedAgentCommands);

// Error handling - let commander handle help/version normally

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('Unexpected error:'), error.message);
  if (program.opts().verbose) {
    console.error(error.stack);
  }
  await cleanupStores();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error(chalk.red('Unhandled rejection at:'), promise, 'reason:', reason);
  await cleanupStores();
  process.exit(1);
});

// Add cleanup hook for SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log(chalk.gray('\nShutting down...'));
  await cleanupStores();
  process.exit(0);
});

// Add cleanup hook for SIGTERM
process.on('SIGTERM', async () => {
  console.log(chalk.gray('\nTerminating...'));
  await cleanupStores();
  process.exit(0);
});

// Parse and execute
program.parse();
