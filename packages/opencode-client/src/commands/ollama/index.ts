import { Command } from 'commander';
import { submitJobCommand } from './submit.js';
import { listCommand } from './list.js';
import { statusCommand } from './status.js';
import { resultCommand } from './result.js';
import { cancelCommand } from './cancel.js';
import { modelsCommand } from './models.js';
import { infoCommand } from './info.js';
import { cacheCommand } from './cache.js';

export const ollamaCommands = new Command('ollama')
  .description('Manage Ollama LLM job queue')
  .alias('oll');

ollamaCommands
  .addCommand(submitJobCommand)
  .addCommand(listCommand)
  .addCommand(statusCommand)
  .addCommand(resultCommand)
  .addCommand(cancelCommand)
  .addCommand(modelsCommand)
  .addCommand(infoCommand)
  .addCommand(cacheCommand);
