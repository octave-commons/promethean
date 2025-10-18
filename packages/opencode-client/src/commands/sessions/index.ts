import { Command } from 'commander';
import { listCommand } from './list.js';
import { getSessionCommand } from './get.js';
import { createSession } from './create.js';
import { closeSession } from './close.js';
import { searchSessions } from './search.js';

export const sessionCommands = new Command('sessions')
  .description('Manage OpenCode sessions')
  .alias('sess');

sessionCommands
  .addCommand(listCommand)
  .addCommand(getSessionCommand)
  .addCommand(createSession)
  .addCommand(closeSession)
  .addCommand(searchSessions);
