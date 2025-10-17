#!/usr/bin/env node

import { AgentOrchestrator } from './agent-orchestrator.js';
import type { AgentOrchestratorConfig } from './types.js';

// Mock OpenCode client for CLI usage
// In a real implementation, you would use the actual OpenCode SDK
const createMockClient = () => ({
  session: {
    create: async ({ body }: { body: { title: string } }) => {
      const mockSession = {
        data: {
          id: `mock-session-${Math.random().toString(36).substring(2, 8)}`,
          title: body.title,
        },
      };
      return mockSession;
    },
    list: async () => ({
      data: [
        {
          id: 'mock-session-1',
          title: 'Mock Session 1',
        },
        {
          id: 'mock-session-2',
          title: 'Mock Session 2',
        },
      ],
    }),
    get: async ({ path: sessionPath }: { path: { id: string } }) => ({
      data: {
        id: sessionPath.id,
        title: `Mock Session ${sessionPath.id}`,
      },
    }),
    delete: async ({ path: sessionPath }: { path: { id: string } }) => {
      console.log(`Mock: Deleted session ${sessionPath.id}`);
    },
    messages: async ({ path: sessionPath }: { path: { id: string } }) => {
      console.log(`Mock: Retrieved messages for session ${sessionPath.id}`);
      return {
        data: [
          {
            info: { id: 'msg-1' },
            parts: [{ type: 'text', text: 'Mock message' }],
          },
        ],
      };
    },
    prompt: async ({
      path: sessionPath,
      body,
    }: {
      path: { id: string };
      body: { parts: any[] };
    }) => {
      console.log(
        `Mock: Sent prompt to session ${sessionPath.id}:`,
        body.parts[0]?.text?.substring(0, 50) + '...',
      );
    },
  },
  event: {
    subscribe: async () => ({
      stream: (async function* () {
        // Mock event stream
        yield {
          type: 'session.idle',
          properties: { sessionID: 'mock-session-1' },
        };
      })(),
    }),
  },
});

interface CLIOptions {
  command: string;
  args: string[];
  flags: Record<string, any>;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const flags: Record<string, any> = {};
  const commandArgs: string[] = [];
  let command = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg.startsWith('--')) {
      const flagName = arg.substring(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        flags[flagName] = nextArg;
        i++; // Skip next arg as it's a value
      } else {
        flags[flagName] = true;
      }
    } else if (!command) {
      command = arg;
    } else {
      commandArgs.push(arg);
    }
  }

  return { command: command || '', args: commandArgs, flags };
}

async function main() {
  const { command, args, flags } = parseArgs();

  if (!command || command === 'help') {
    console.log(`
Agent Orchestrator CLI

Usage:
  agent-orchestrator <command> [options]

Commands:
  spawn <prompt>           Spawn a new agent with the given prompt
  monitor                  Monitor all active agents
  status <sessionId>       Get status of a specific agent
  list                     List all sessions
  send <sessionId> <msg>   Send message to an agent
  cleanup                  Cleanup completed agents
  help                     Show this help message

Options:
  --files <file1,file2>    Comma-separated list of files to include
  --delegates <agent1,agent2> Comma-separated list of agents to delegate to
  --priority <level>       Message priority (low, medium, high, urgent)
  --type <type>            Message type (instruction, query, update, coordination, status_request)
  --limit <number>         Limit for list command (default: 20)
  --offset <number>        Offset for list command (default: 0)
  --timeout <minutes>      Timeout threshold in minutes (default: 30)
  --no-persistence         Disable persistent storage
  --auto-cleanup           Enable automatic cleanup

Examples:
  agent-orchestrator spawn "Analyze the codebase for security issues"
  agent-orchestrator send ses_abc123 "Please provide an update on your progress"
  agent-orchestrator monitor
  agent-orchestrator list --limit 10
  agent-orchestrator cleanup --timeout 120
`);
    return;
  }

  try {
    // Create configuration
    const config: AgentOrchestratorConfig = {
      timeoutThreshold: flags.timeout ? parseInt(flags.timeout) * 60 * 1000 : undefined,
      persistenceEnabled: !flags['no-persistence'],
      autoCleanup: flags['auto-cleanup'] || false,
    };

    // Initialize orchestrator with mock client
    const client = createMockClient();
    const orchestrator = new AgentOrchestrator(client, config);
    await orchestrator.initialize();

    switch (command) {
      case 'spawn': {
        const prompt = args.join(' ');
        if (!prompt) {
          console.error('Error: Prompt is required for spawn command');
          process.exit(1);
        }

        const files = flags.files ? flags.files.split(',').map((f: string) => f.trim()) : undefined;
        const delegates = flags.delegates
          ? flags.delegates.split(',').map((d: string) => d.trim())
          : undefined;

        const result = await orchestrator.spawnAgent({ prompt, files, delegates });
        console.log(result);
        break;
      }

      case 'monitor': {
        const summary = await orchestrator.monitorAgents();
        console.log('\n📊 Agent Monitoring Summary');
        console.log('==========================');
        console.log(`Total Agents: ${summary.totalAgents}`);
        console.log(`Running: ${summary.running}`);
        console.log(`Completed: ${summary.completed}`);
        console.log(`Failed: ${summary.failed}`);
        console.log(`Idle: ${summary.idle}`);

        if (summary.agents.length > 0) {
          console.log('\n📋 Agent Details:');
          summary.agents.forEach((agent, index) => {
            console.log(`${index + 1}. ${agent.sessionId.substring(0, 8)}... (${agent.status})`);
            console.log(
              `   Task: ${agent.task.substring(0, 80)}${agent.task.length > 80 ? '...' : ''}`,
            );
            console.log(`   Duration: ${agent.duration}s`);
            if (agent.completionMessage) {
              console.log(`   Completion: ${agent.completionMessage.substring(0, 60)}...`);
            }
            console.log('');
          });
        }
        break;
      }

      case 'status': {
        const sessionId = args[0];
        if (!sessionId) {
          console.error('Error: Session ID is required for status command');
          process.exit(1);
        }

        const status = await orchestrator.getAgentStatus(sessionId);
        if (typeof status === 'string') {
          console.log(status);
        } else {
          console.log('\n📈 Agent Status');
          console.log('================');
          console.log(`Session ID: ${status.sessionId}`);
          console.log(`Status: ${status.status}`);
          console.log(`Task: ${status.task}`);
          console.log(`Started: ${status.startTime}`);
          console.log(`Last Activity: ${status.lastActivity}`);
          console.log(`Duration: ${status.duration}s`);
          if (status.completionMessage) {
            console.log(`Completion Message: ${status.completionMessage}`);
          }
        }
        break;
      }

      case 'list': {
        const limit = flags.limit ? parseInt(flags.limit) : 20;
        const offset = flags.offset ? parseInt(flags.offset) : 0;

        const sessions = await orchestrator.listSessions(limit, offset);
        console.log('\n📚 Sessions');
        console.log('============');
        console.log(
          `Total: ${sessions.totalCount} | Page ${sessions.pagination.currentPage}/${sessions.pagination.totalPages}`,
        );
        console.log(
          `Active: ${sessions.summary.active} | Waiting: ${sessions.summary.waiting_for_input} | Idle: ${sessions.summary.idle} | Agent Tasks: ${sessions.summary.agentTasks}`,
        );

        if (sessions.sessions.length > 0) {
          console.log('\n📋 Session Details:');
          sessions.sessions.forEach((session, index) => {
            const agentMarker = session.isAgentTask ? '🤖' : '💬';
            console.log(
              `${index + 1}. ${agentMarker} ${session.id.substring(0, 8)}... (${session.activityStatus})`,
            );
            console.log(`   Title: ${session.title}`);
            console.log(`   Messages: ${session.messageCount} | Age: ${session.sessionAge}s`);
            if (session.error) {
              console.log(`   ⚠️  ${session.error}`);
            }
            console.log('');
          });
        }

        if (sessions.pagination.hasMore) {
          console.log(
            `\n--- More sessions available (use --offset ${sessions.pagination.offset + sessions.pagination.limit}) ---`,
          );
        }
        break;
      }

      case 'send': {
        const sessionId = args[0];
        const message = args.slice(1).join(' ');

        if (!sessionId || !message) {
          console.error('Error: Session ID and message are required for send command');
          process.exit(1);
        }

        const priority = flags.priority || 'medium';
        const messageType = flags.type || 'instruction';

        const result = await orchestrator.sendAgentMessage(
          sessionId,
          message,
          priority as any,
          messageType as any,
        );
        console.log(result);
        break;
      }

      case 'cleanup': {
        const olderThan = flags.timeout ? parseInt(flags.timeout) : 60;
        const result = await orchestrator.cleanupCompletedAgents(olderThan);
        console.log(result);
        break;
      }

      default:
        console.error(`Error: Unknown command '${command}'`);
        console.log('Use "agent-orchestrator help" for available commands');
        process.exit(1);
    }

    await orchestrator.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
