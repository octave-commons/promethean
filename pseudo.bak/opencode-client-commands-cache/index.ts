import { Command } from 'commander';
import { listCacheCommand } from './list.js';
import { clearCacheCommand } from './clear.js';
import { getCacheCommand } from './get.js';
import { setCacheCommand } from './set.js';

export const cacheCommands = new Command('cache')
  .description('Cache management and optimization')
  .alias('c');

cacheCommands
  .addCommand(listCacheCommand)
  .addCommand(clearCacheCommand)
  .addCommand(getCacheCommand)
  .addCommand(setCacheCommand);
