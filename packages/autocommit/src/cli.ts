#!/usr/bin/env node
import { Command } from 'commander';

import { ConfigSchema } from './config.js';

import { start } from './index.js';

const program = new Command();
program
  .name('autocommit')
  .description('Watch a git repo and auto-commit with LLM-generated messages.')
  .option('-p, --path <dir>', 'repo root (defaults to cwd)')
  .option('-r, --recursive', 'detect and watch all git repos recursively', false)
  .option('-d, --debounce-ms <ms>', 'debounce window in ms', '10000')
  .option(
    '--base-url <url>',
    'OpenAI-compatible base URL (default: Ollama http://localhost:11434/v1)',
  )
  .option('--api-key <key>', 'API key (not required for local Ollama)')
  .option('-m, --model <model>', 'model name for chat completions')
  .option('--temperature <t>', 'sampling temperature', '0.2')
  .option('--max-diff-bytes <n>', 'cap diff bytes sent to LLM', '20000')
  .option('--exclude <globs>', 'comma-separated extra ignore globs')
  .option('--handle-subrepos', 'detect and handle git subrepos', false)
  .option(
    '--subrepo-strategy <strategy>',
    'how to handle subrepos: separate|integrated',
    'integrated',
  )
  .option('--signoff', 'append Signed-off-by', false)
  .option('--dry-run', 'do not actually commit', false)
  .option('--quiet', 'suppress non-error output', false)
  .action(async (opts) => {
    const cfg = ConfigSchema.parse(opts);
    await start(cfg);
  });

program.parseAsync().catch((err) => {
  let errorMessage = 'Unknown error occurred';
  if (err instanceof Error) {
    errorMessage = err.message;
    if (err.stack) {
      // Only include stack if it's not too long
      const stackStr = err.stack;
      if (stackStr && stackStr.length < 1000) {
        errorMessage = stackStr;
      }
    }
  } else if (typeof err === 'string') {
    errorMessage = err;
  } else if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    const message = errorObj.message || errorObj.error || 'Unknown error';
    errorMessage = typeof message === 'string' ? message : String(message);
    
    // Truncate very long messages
    if (errorMessage.length > 500) {
      errorMessage = errorMessage.substring(0, 500) + '...';
    }
  }
  
  console.error(errorMessage);
  process.exit(1);
});
