import { Command } from 'commander';
import chalk from 'chalk';
import { listSessions } from './list.js';
import { getSession } from './get.js';
import { createSession } from './create.js';
import { closeSession } from './close.js';
import { searchSessions } from './search.js';

export const sessionCommands = new Command('sessions')
  .description('Manage OpenCode sessions')
  .alias('sess');

sessionCommands
  .addCommand(listSessions)
  .addCommand(getSession)
  .addCommand(createSession)
  .addCommand(closeSession)
  .addCommand(searchSessions);
