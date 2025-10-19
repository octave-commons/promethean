import { Command } from 'commander';
import { startIndexerCommand } from './start.js';
import { stopIndexerCommand } from './stop.js';
import { statusIndexerCommand } from './status.js';

export const indexerCommands = new Command('indexer')
  .description('Manage the event indexer service')
  .addCommand(startIndexerCommand)
  .addCommand(stopIndexerCommand)
  .addCommand(statusIndexerCommand);
