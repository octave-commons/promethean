#!/usr/bin/env node
import { Command } from 'commander';

import { ConfigSchema } from './config.js';

import { start } from './index.js';

const program = new Command();
program
  .name('autocommit')
  .description('Watch a git repo and auto-commit with LLM-generated messages.')
  .option('-p, --path <dir>', 'repo root (defaults to cwd)')
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
  .option('--signoff', 'append Signed-off-by', false)
  .option('--dry-run', 'do not actually commit', false)
  .action(async (opts) => {
    const cfg = ConfigSchema.parse(opts);
    await start(cfg);
  });

program.parseAsync().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
