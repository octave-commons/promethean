import { Command } from 'commander';
import { listCommand } from './list.js';
import { subscribeCommand } from './subscribe.js';

export const eventCommands = new Command('events')
  .description('View OpenCode events (list or subscribe)')
  .alias('ev');

eventCommands
  .addCommand(listCommand)
  .addCommand(subscribeCommand);
