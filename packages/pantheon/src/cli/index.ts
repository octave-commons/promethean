#!/usr/bin/env node

import { makeContextAdapter, makeActorAdapter } from '../index.js';
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

program.parse();
