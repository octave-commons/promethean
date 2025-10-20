#!/usr/bin/env node

import {
  makeContextAdapter,
  makeActorAdapter,
  makeLLMActorAdapter,
  makeOpenAIAdapter,
} from '../index.js';
import { makeMCPAdapterWithDefaults } from '@promethean/pantheon-mcp';
import { Command } from 'commander';

const program = new Command();

program.name('pantheon').description('Pantheon Agent Management Framework').version('1.0.0');

// Context commands
program
  .command('context:compile')
  .description('Compile context from sources')
  .option('--sources <sources>', 'Comma-separated list of sources', 'sessions,agent-tasks')
  .option('--text <text>', 'Text to compile')
  .action(async (options: { sources: string; text: string }) => {
    try {
      const contextAdapter = makeContextAdapter();
      const sources = options.sources.split(',').map((s: string) => s.trim());
      const text = options.text || 'hello world';

      const context = await contextAdapter.compile(sources, text);
      console.log('Context compiled:', JSON.stringify(context, null, 2));
    } catch (error) {
      console.error('Error compiling context:', error);
      process.exit(1);
    }
  });

// Actor commands
program
  .command('actors:tick')
  .description('Tick an actor')
  .argument('<actorId>', 'Actor ID to tick')
  .action(async (actorId: string) => {
    try {
      const actorAdapter = makeActorAdapter();
      await actorAdapter.tick(actorId);
      console.log(`Actor ${actorId} ticked successfully`);
    } catch (error) {
      console.error('Error ticking actor:', error);
      process.exit(1);
    }
  });

// MCP commands
program
  .command('mcp:execute')
  .description('Execute an MCP tool')
  .argument('<toolName>', 'Name of the tool to execute')
  .option('--args <args>', 'JSON string of arguments', '{}')
  .action(async (toolName, options) => {
    try {
      const mcpAdapter = makeMCPAdapterWithDefaults();
      const args = JSON.parse(options.args);

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
      console.log('Available MCP tools:');
      tools.forEach((tool: string) => console.log(`  - ${tool}`));
    } catch (error) {
      console.error('Error listing MCP tools:', error);
      process.exit(1);
    }
  });

// LLM Actor commands
program
  .command('llm-actor:create')
  .description('Create an LLM-powered actor')
  .option('--name <name>', 'Name of the actor', 'llm-assistant')
  .option('--prompt <prompt>', 'System prompt for the actor', 'You are a helpful AI assistant.')
  .option('--model <model>', 'OpenAI model to use', 'gpt-3.5-turbo')
  .option('--api-key <key>', 'OpenAI API key (or set OPENAI_API_KEY env var)')
  .action(async (options) => {
    try {
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          'OpenAI API key required. Set OPENAI_API_KEY environment variable or use --api-key option',
        );
      }

      const llmAdapter = makeOpenAIAdapter({
        apiKey,
        defaultModel: options.model,
      });

      const llmActorAdapter = makeLLMActorAdapter();

      const actorId = await llmActorAdapter.create({
        name: options.name,
        type: 'llm',
        parameters: { model: options.model },
        llm: llmAdapter,
        systemPrompt: options.prompt,
        maxMessages: 20,
      });

      console.log(`Created LLM actor: ${actorId}`);

      // Store the adapter for later use (in real implementation, this would be managed properly)
      (global as any).llmActorAdapter = llmActorAdapter;
    } catch (error) {
      console.error('Error creating LLM actor:', error);
      process.exit(1);
    }
  });

program
  .command('llm-actor:message')
  .description('Send a message to an LLM actor')
  .argument('<actorId>', 'ID of the LLM actor')
  .argument('<message>', 'Message to send')
  .action(async (actorId, message) => {
    try {
      const llmActorAdapter = (global as any).llmActorAdapter;
      if (!llmActorAdapter) {
        throw new Error('No LLM actor adapter found. Create an actor first using llm-actor:create');
      }

      await llmActorAdapter.addMessage(actorId, {
        role: 'user',
        content: message,
      });

      await llmActorAdapter.tick(actorId);

      const messages = await llmActorAdapter.getMessages(actorId);
      const lastMessage = messages[messages.length - 1];

      console.log(`Actor response: ${lastMessage?.content || 'No response'}`);
    } catch (error) {
      console.error('Error sending message to LLM actor:', error);
      process.exit(1);
    }
  });

program.parse();
