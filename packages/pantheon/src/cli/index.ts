#!/usr/bin/env node

import { Command } from 'commander';
import {
  makeOrchestrator,
  makeInMemoryContextAdapter,
  makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter,
  type ActorScript,
} from '@promethean/pantheon-core';
import { createLLMActor, createToolActor, createCompositeActor } from '../actors/index.js';
import { makeOpenAIAdapter } from '../adapters/index.js';
import { makeMCPAdapterWithDefaults } from '@promethean/pantheon-mcp';
import { createConsoleLogger } from '../utils/index.js';

const program = new Command();
const logger = createConsoleLogger('info');

// Global system state (in production, this would be managed properly)
let system: any = null;

const getSystem = () => {
  if (!system) {
    // Create in-memory system for demo purposes
    const contextAdapter = makeInMemoryContextAdapter();
    const toolAdapter = makeInMemoryToolAdapter();
    const llmAdapter = makeInMemoryLlmAdapter();
    const messageBusAdapter = makeInMemoryMessageBusAdapter();
    const schedulerAdapter = makeInMemorySchedulerAdapter();
    const actorStateAdapter = makeInMemoryActorStateAdapter();

    const orchestrator = makeOrchestrator({
      now: () => Date.now(),
      log: logger.info,
      context: contextAdapter,
      tools: toolAdapter,
      llm: llmAdapter,
      bus: messageBusAdapter,
      schedule: schedulerAdapter,
      state: actorStateAdapter,
    });

    system = {
      orchestrator,
      adapters: {
        context: contextAdapter,
        tools: toolAdapter,
        llm: llmAdapter,
        messageBus: messageBusAdapter,
        scheduler: schedulerAdapter,
        actorState: actorStateAdapter,
      },
    };
  }
  return system;
};

program.name('pantheon').description('Pantheon Agent Management Framework CLI').version('1.0.0');

// Actor management commands
program
  .command('actor:create')
  .description('Create a new actor')
  .argument('<type>', 'Actor type: llm, tool, composite')
  .argument('<name>', 'Name of the actor')
  .option('--goal <goal>', 'Initial goal for the actor', 'Assist with tasks')
  .option('--config <config>', 'JSON configuration for the actor', '{}')
  .action(async (type: string, name: string, options: { goal: string; config: string }) => {
    try {
      const { adapters } = getSystem();
      let actorScript: ActorScript;

      const config = JSON.parse(options.config);

      switch (type.toLowerCase()) {
        case 'llm':
          actorScript = createLLMActor(name, config);
          break;
        case 'tool':
          actorScript = createToolActor(name, config);
          break;
        case 'composite':
          actorScript = createCompositeActor(name, config);
          break;
        default:
          throw new Error(`Unknown actor type: ${type}. Use: llm, tool, or composite`);
      }

      const actor = await adapters.actorState.spawn(actorScript, options.goal);
      console.log(`Created actor: ${actor.id}`);
      console.log(`Name: ${actor.script.name}`);
      console.log(`Type: ${type}`);
      console.log(`Goal: ${options.goal}`);
      console.log(`Talents: ${actor.script.talents.map((t: any) => t.name).join(', ')}`);
    } catch (error) {
      console.error('Error creating actor:', error);
      process.exit(1);
    }
  });

program
  .command('actor:list')
  .description('List all actors')
  .action(async () => {
    try {
      const { adapters } = getSystem();
      const actors = await adapters.actorState.list();

      if (actors.length === 0) {
        console.log('No actors found');
        return;
      }

      console.log('Actors:');
      actors.forEach((actor: any) => {
        console.log(`  ${actor.id}: ${actor.script.name} (${actor.state})`);
        console.log(`    Goals: ${actor.goals.join(', ')}`);
        console.log(`    Talents: ${actor.script.talents.map((t: any) => t.name).join(', ')}`);
        console.log(`    Created: ${actor.createdAt.toISOString()}`);
        console.log();
      });
    } catch (error) {
      console.error('Error listing actors:', error);
      process.exit(1);
    }
  });

program
  .command('actor:tick')
  .description('Tick an actor (execute one cycle)')
  .argument('<actorId>', 'ID of the actor to tick')
  .option('--message <message>', 'Optional user message to send')
  .action(async (actorId: string, options: { message?: string }) => {
    try {
      const { orchestrator, adapters } = getSystem();
      const actor = await adapters.actorState.get(actorId);

      if (!actor) {
        throw new Error(`Actor ${actorId} not found`);
      }

      console.log(`Ticking actor: ${actor.script.name} (${actorId})`);

      await orchestrator.tickActor(
        actor,
        options.message ? { userMessage: options.message } : undefined,
      );

      console.log('Actor tick completed');

      // Show updated actor state
      const updatedActor = await adapters.actorState.get(actorId);
      console.log(`New state: ${updatedActor?.state}`);
    } catch (error) {
      console.error('Error ticking actor:', error);
      process.exit(1);
    }
  });

program
  .command('actor:start')
  .description('Start an actor loop')
  .argument('<actorId>', 'ID of the actor to start')
  .option('--interval <interval>', 'Tick interval in milliseconds', '5000')
  .action(async (actorId: string, options: { interval: string }) => {
    try {
      const { orchestrator, adapters } = getSystem();
      const actor = await adapters.actorState.get(actorId);

      if (!actor) {
        throw new Error(`Actor ${actorId} not found`);
      }

      const interval = parseInt(options.interval);
      console.log(
        `Starting actor loop for ${actor.script.name} (${actorId}) with ${interval}ms interval`,
      );

      const stopLoop = orchestrator.startActorLoop(actor, interval);

      console.log('Actor loop started. Press Ctrl+C to stop.');

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\\nStopping actor loop...');
        stopLoop();
        process.exit(0);
      });

      // Keep the process alive
      await new Promise(() => {});
    } catch (error) {
      console.error('Error starting actor loop:', error);
      process.exit(1);
    }
  });

// Context commands
program
  .command('context:compile')
  .description('Compile context from sources')
  .option('--text <text>', 'Text to include in context')
  .option('--sources <sources>', 'Comma-separated list of context source IDs', '')
  .action(async (options: { text?: string; sources: string }) => {
    try {
      const { adapters } = getSystem();

      const sources = options.sources
        ? options.sources.split(',').map((s) => ({ id: s.trim(), label: s.trim() }))
        : [];

      const messages = await adapters.context.compile({
        texts: options.text ? [options.text] : [],
        sources,
      });

      console.log('Compiled context:');
      messages.forEach((msg: any, index: number) => {
        console.log(`  ${index + 1}. [${msg.role}] ${msg.content}`);
      });
    } catch (error) {
      console.error('Error compiling context:', error);
      process.exit(1);
    }
  });

// Tool commands
program
  .command('tool:execute')
  .description('Execute a tool')
  .argument('<toolName>', 'Name of the tool to execute')
  .argument('<args>', 'JSON arguments for the tool')
  .action(async (toolName: string, argsString: string) => {
    try {
      const { adapters } = getSystem();

      let args;
      try {
        args = JSON.parse(argsString);
      } catch {
        throw new Error('Invalid JSON arguments');
      }

      const result = await adapters.tools.invoke(toolName, args);
      console.log(`Tool ${toolName} executed:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error executing tool:', error);
      process.exit(1);
    }
  });

// MCP integration commands
program
  .command('mcp:execute')
  .description('Execute an MCP tool')
  .argument('<toolName>', 'Name of the MCP tool to execute')
  .argument('<args>', 'JSON arguments for the tool')
  .action(async (toolName: string, argsString: string) => {
    try {
      const mcpAdapter = makeMCPAdapterWithDefaults();
      const args = JSON.parse(argsString);

      const result = await mcpAdapter.execute(toolName, args);
      console.log('MCP Tool executed:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error executing MCP tool:', error);
      process.exit(1);
    }
  });

program
  .command('mcp:list')
  .description('List available MCP tools')
  .action(async () => {
    try {
      const mcpAdapter = makeMCPAdapterWithDefaults();
      const tools = (await mcpAdapter.list?.()) || [];

      if (tools.length === 0) {
        console.log('No MCP tools available');
        return;
      }

      console.log('Available MCP tools:');
      for (const toolName of tools) {
        const schema = await mcpAdapter.getSchema?.(toolName);
        console.log(`  ${toolName}:`);
        if (schema?.description) {
          console.log(`    Description: ${schema.description}`);
        }
        if (schema?.properties) {
          console.log(`    Properties: ${Object.keys(schema.properties).join(', ')}`);
        }
        console.log();
      }
    } catch (error) {
      console.error('Error listing MCP tools:', error);
      process.exit(1);
    }
  });

// OpenAI integration commands
program
  .command('openai:chat')
  .description('Chat with OpenAI (requires OPENAI_API_KEY)')
  .argument('<message>', 'Message to send to OpenAI')
  .option('--model <model>', 'OpenAI model to use', 'gpt-3.5-turbo')
  .option('--temperature <temperature>', 'Temperature for response', '0.7')
  .action(async (message: string, options: { model: string; temperature: string }) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable required');
      }

      const openaiAdapter = makeOpenAIAdapter({
        apiKey,
        defaultModel: options.model,
        defaultTemperature: parseFloat(options.temperature),
      });

      const messages = [{ role: 'user' as const, content: message }];
      const response = await openaiAdapter.complete(messages, {
        model: options.model,
        temperature: parseFloat(options.temperature),
      });

      console.log(`OpenAI Response: ${response.content}`);
    } catch (error) {
      console.error('Error chatting with OpenAI:', error);
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Run a demo of the Pantheon framework')
  .action(async () => {
    try {
      console.log('🎭 Pantheon Framework Demo\\n');

      const { orchestrator, adapters } = getSystem();

      // Create an LLM actor
      console.log('1. Creating LLM actor...');
      const llmScript = createLLMActor('demo-assistant', {
        model: 'demo-model',
        temperature: 0.7,
        systemPrompt: 'You are a helpful AI assistant for the Pantheon framework demo.',
      });

      const actor = await adapters.actorState.spawn(
        llmScript,
        'Help users understand the Pantheon framework',
      );
      console.log(`   Created actor: ${actor.id}`);

      // Tick the actor
      console.log('\\n2. Ticking actor...');
      await orchestrator.tickActor(actor, { userMessage: 'What is the Pantheon framework?' });
      console.log('   Actor tick completed');

      // Show final state
      const finalActor = await adapters.actorState.get(actor.id);
      console.log(`\\n3. Final actor state: ${finalActor?.state}`);

      // List all actors
      console.log('\\n4. All actors:');
      const allActors = await adapters.actorState.list();
      allActors.forEach((a: any) => {
        console.log(`   - ${a.script.name} (${a.id}): ${a.state}`);
      });

      console.log('\\n✅ Demo completed successfully!');
    } catch (error) {
      console.error('❌ Demo failed:', error);
      process.exit(1);
    }
  });

program.parse();
