import { Command } from 'commander';
import { listCommand } from './list.js';
import { getSessionCommand } from './get.js';
import { createSessionCommand } from './create.js';
import { closeSession } from './close.js';
import { searchSessions } from './search.js';

export const sessionCommands = new Command('sessions')
  .description('Manage OpenCode sessions')
  .alias('sess');

sessionCommands
  .addCommand(listCommand)
  .addCommand(getSessionCommand)
  .addCommand(createSessionCommand)
  .addCommand(closeSession)
  .addCommand(searchSessions);
