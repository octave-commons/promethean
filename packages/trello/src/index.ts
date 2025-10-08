#!/usr/bin/env node

/**
 * Trello integration for Promethean kanban board synchronization
 *
 * This package provides seamless synchronization between the internal Promethean
 * kanban system and Trello boards, with full automation of board creation,
 * card management, and organization.
 */

export { TrelloClient } from './lib/trello-client.js';
export { KanbanToTrelloSync } from './lib/kanban-to-trello-sync.js';
export type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloConfig,
  KanbanTask,
  SyncOptions
} from './lib/types.js';

// Re-export main classes for easy usage
export default {
  TrelloClient,
  KanbanToTrelloSync
};