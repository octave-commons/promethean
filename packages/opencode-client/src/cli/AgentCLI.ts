#!/usr/bin/env node

/**
 * Command Line Interface for Unified Agent Management
 * Provides simple commands for managing agent sessions and tasks
 */

import { Command } from 'commander';
import {
  createAgentSession,
  startAgentSession,
  stopAgentSession,
  sendMessageToAgent,
  closeAgentSession,
  unifiedAgentManager,
} from '../api/UnifiedAgentManager.js';
import { initializeStores } from '../index.js';
import { DualStoreManager } from '@promethean/persistence';

// Initialize stores for agent CLI
let storesInitialized = false;
let initPromise: Promise<void> | null = null;
let sessionStore: DualStoreManager<'text', 'timestamp'> | null = null;
let agentTaskStore: DualStoreManager<'text', 'timestamp'> | null = null;

async function initializeAgentCliStores() {
  if (storesInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      sessionStore = await DualStoreManager.create('agent-sessions', 'text', 'timestamp');
      agentTaskStore = await DualStoreManager.create('agent-tasks', 'text', 'timestamp');

      initializeStores(sessionStore, agentTaskStore);
      storesInitialized = true;

      if (process.env.OPENCODE_DEBUG) {
        console.log('Agent CLI stores initialized');
      }
    } catch (error) {
      console.warn('Warning: Failed to initialize Agent CLI stores:', error);
      throw error;
    }
  })();

  return initPromise;
}

const program = new Command();

program.name('agent-cli').description('CLI for managing agent sessions and tasks').version('1.0.0');

// Initialize stores before any command
program.hook('preAction', async () => {
  await initializeAgentCliStores();
});

// Create agent session command
program
  .command('create')
  .description('Create a new agent session with task')
  .argument('<task>', 'Task description for the agent')
  .option('-m, --message <message>', 'Initial message to send to the agent')
  .option('-t, --title <title>', 'Session title')
  .option('-f, --files <files...>', 'Files to include in the session')
  .option('-d, --delegates <delegates...>', 'Delegates to assign to the session')
  .option('-p, --priority <priority>', 'Task priority (low, medium, high, urgent)', 'medium')
  .option('--auto-start', 'Automatically start the agent session', false)
  .action(async (task, options) => {
    try {
      console.log(`Creating agent session for task: ${task}`);

      const session = await createAgentSession(
        task,
        options.message,
        {
          title: options.title,
          files: options.files,
          delegates: options.delegates,
          priority: options.priority,
        },
        {
          autoStart: options.autoStart,
        },
      );

      console.log(`✅ Agent session created successfully!`);
      console.log(`   Session ID: ${session.sessionId}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Created: ${session.createdAt.toISOString()}`);

      if (options.autoStart) {
        console.log(`   Agent started automatically`);
      }
    } catch (error) {
      console.error(`❌ Failed to create agent session: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Start agent session command
program
  .command('start')
  .description('Start an existing agent session')
  .argument('<sessionId>', 'ID of the session to start')
  .action(async (sessionId) => {
    try {
      console.log(`Starting agent session: ${sessionId}`);
      await startAgentSession(sessionId);
      console.log(`✅ Agent session started successfully!`);
    } catch (error) {
      console.error(`❌ Failed to start session: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Stop agent session command
program
  .command('stop')
  .description('Stop an agent session')
  .argument('<sessionId>', 'ID of the session to stop')
  .option('-m, --message <message>', 'Completion message')
  .action(async (sessionId) => {
    try {
      console.log(`Starting agent session: ${sessionId}`);
      await startAgentSession(sessionId);
      console.log(`✅ Agent session started successfully!`);
    } catch (error) {
      console.error(`❌ Failed to start session: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Send message command
program
  .command('send')
  .description('Send a message to an agent session')
  .argument('<sessionId>', 'ID of the session')
  .argument('<message>', 'Message to send')
  .option('-t, --type <type>', 'Message type', 'user')
  .action(async (sessionId, message, options) => {
    try {
      console.log(`Sending message to session ${sessionId}: ${message}`);
      await sendMessageToAgent(sessionId, message, options.type);
      console.log(`✅ Message sent successfully!`);
    } catch (error) {
      console.error(`❌ Failed to send message: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Close session command
program
  .command('close')
  .description('Close an agent session')
  .argument('<sessionId>', 'ID of the session to close')
  .action(async (sessionId) => {
    try {
      console.log(`Closing agent session: ${sessionId}`);
      await closeAgentSession(sessionId);
      console.log(`✅ Agent session closed successfully!`);
    } catch (error) {
      console.error(`❌ Failed to close session: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// List sessions command
program
  .command('list')
  .description('List all active agent sessions')
  .option('-s, --status <status>', 'Filter by status')
  .option('--format <format>', 'Output format (table, json)', 'table')
  .action(async (options) => {
    try {
      let sessions = await unifiedAgentManager.listAgentSessions();

      if (options.status) {
        sessions = sessions.filter((s) => s.status === options.status);
      }

      if (sessions.length === 0) {
        console.log('No active sessions found.');
        return;
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(sessions, null, 2));
      } else {
        console.log('\n📋 Active Agent Sessions');
        console.log('─'.repeat(80));
        console.log('Session ID\t\tStatus\t\tCreated\t\t\tTask');
        console.log('─'.repeat(80));

        sessions.forEach((session) => {
          const taskId = session.task.sessionId.substring(0, 8);
          const taskPreview =
            session.task.task.substring(0, 30) + (session.task.task.length > 30 ? '...' : '');
          console.log(
            `${taskId}\t\t${session.status}\t${session.createdAt.toISOString()}\t${taskPreview}`,
          );
        });
        console.log('─'.repeat(80));
        console.log(`Total: ${sessions.length} session(s)`);
      }
    } catch (error) {
      console.error(`❌ Failed to list sessions: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Session info command
program
  .command('info')
  .description('Get detailed information about a session')
  .argument('<sessionId>', 'ID of the session')
  .action(async (sessionId) => {
    try {
      const session = await unifiedAgentManager.getAgentSession(sessionId);

      if (!session) {
        console.error(`❌ Session ${sessionId} not found`);
        process.exit(1);
      }

      console.log('\n📊 Session Information');
      console.log('─'.repeat(50));
      console.log(`Session ID: ${session.sessionId}`);
      console.log(`Status: ${session.status}`);
      console.log(`Created: ${session.createdAt.toISOString()}`);
      console.log(`Task: ${session.task.task}`);
      console.log(`Task Status: ${session.task.status}`);
      console.log(`Last Activity: ${new Date(session.task.lastActivity).toISOString()}`);

      if (session.task.completionMessage) {
        console.log(`Completion Message: ${session.task.completionMessage}`);
      }

      console.log('─'.repeat(50));
    } catch (error) {
      console.error(`❌ Failed to get session info: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show session statistics')
  .action(async () => {
    try {
      const stats = await unifiedAgentManager.getSessionStats();

      console.log('\n📈 Session Statistics');
      console.log('─'.repeat(40));
      console.log(`Total Sessions: ${stats.total}`);
      console.log(`Average Age: ${Math.round(stats.averageAge / 1000)}s`);

      console.log('\nBy Status:');
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('─'.repeat(40));
    } catch (error) {
      console.error(`❌ Failed to get stats: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Cleanup command
program
  .command('cleanup')
  .description('Cleanup old completed/failed sessions')
  .option('-a, --age <hours>', 'Maximum age in hours (default: 24)', '24')
  .action(async (options) => {
    try {
      const maxAge = parseInt(options.age) * 60 * 60 * 1000;
      console.log(`Cleaning up sessions older than ${options.age} hours...`);

      const cleaned = await unifiedAgentManager.cleanupOldSessions(maxAge);

      if (cleaned > 0) {
        console.log(`✅ Cleaned up ${cleaned} old session(s)`);
      } else {
        console.log(`ℹ️  No sessions to clean up`);
      }
    } catch (error) {
      console.error(`❌ Failed to cleanup: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Interactive mode
program
  .command('interactive')
  .description('Start interactive mode for managing sessions')
  .action(async () => {
    console.log('🎮 Interactive Agent Session Manager');
    console.log('Type "help" for available commands or "exit" to quit\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const ask = (question: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(question, resolve);
      });
    };

    while (true) {
      const input = await ask('agent> ');

      if (input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        break;
      }

      if (input.toLowerCase() === 'help') {
        console.log(`
Available commands:
  list                    - List all sessions
  create <task>           - Create new session
  start <sessionId>       - Start a session
  stop <sessionId>        - Stop a session  
  send <sessionId> <msg>  - Send message to session
  info <sessionId>        - Get session info
  stats                   - Show statistics
  cleanup                 - Cleanup old sessions
  help                    - Show this help
  exit                    - Exit interactive mode
        `);
        continue;
      }

      // Parse and execute commands
      const parts = input.trim().split(' ');
      const command = parts[0];
      const args = parts.slice(1);

      try {
        switch (command) {
          case 'list':
            const sessions = await unifiedAgentManager.listAgentSessions();
            if (sessions.length === 0) {
              console.log('No active sessions.');
            } else {
              sessions.forEach((s) => {
                console.log(
                  `${s.sessionId.substring(0, 8)}\t${s.status}\t${s.task.task.substring(0, 30)}...`,
                );
              });
            }
            break;

          case 'create':
            if (args.length === 0) {
              console.log('Usage: create <task description>');
              break;
            }
            const newSession = await createAgentSession(args.join(' '));
            console.log(`Created session: ${newSession.sessionId}`);
            break;

          case 'start':
            if (args.length === 0) {
              console.log('Usage: start <sessionId>');
              break;
            }
            await startAgentSession(args[0]!);
            console.log('Session started');
            break;

          case 'stop':
            if (args.length === 0) {
              console.log('Usage: stop <sessionId>');
              break;
            }
            await stopAgentSession(args[0]!);
            console.log('Session stopped');
            break;

          case 'send':
            if (args.length < 2) {
              console.log('Usage: send <sessionId> <message>');
              break;
            }
            await sendMessageToAgent(args[0]!, args.slice(1).join(' '));
            console.log('Message sent');
            break;

          case 'info':
            if (args.length === 0) {
              console.log('Usage: info <sessionId>');
              break;
            }
            const session = unifiedAgentManager.getAgentSession(args[0]!);
            if (session) {
              console.log(JSON.stringify(session, null, 2));
            } else {
              console.log('Session not found');
            }
            break;

          case 'stats':
            const stats = unifiedAgentManager.getSessionStats();
            console.log(JSON.stringify(stats, null, 2));
            break;

          case 'cleanup':
            const cleaned = await unifiedAgentManager.cleanupOldSessions();
            console.log(`Cleaned ${cleaned} sessions`);
            break;

          default:
            console.log(`Unknown command: ${command}. Type "help" for available commands.`);
        }
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
      }
    }
  });

// Cleanup function to close all store instances
async function cleanupStores() {
  if (sessionStore) {
    try {
      await sessionStore.cleanup();
      sessionStore = null;
    } catch (error) {
      console.warn('Warning: Failed to cleanup session store:', error);
    }
  }

  if (agentTaskStore) {
    try {
      await agentTaskStore.cleanup();
      agentTaskStore = null;
    } catch (error) {
      console.warn('Warning: Failed to cleanup agent task store:', error);
    }
  }

  storesInitialized = false;
  initPromise = null;
}

// Register cleanup handlers for process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, cleaning up...');
  await cleanupStores();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  await cleanupStores();
  process.exit(0);
});

// Parse command line arguments
program.parse();

export { program };
