import { Command } from 'commander';
import { listMessagesCommand } from './list.js';
import { getMessageCommand } from './get.js';
import { sendMessageCommand } from './send.js';

export const messagesCommands = new Command('messages')
  .description('Message processing and analysis')
  .alias('msg');

messagesCommands
  .addCommand(listMessagesCommand)
  .addCommand(getMessageCommand)
  .addCommand(sendMessageCommand);
