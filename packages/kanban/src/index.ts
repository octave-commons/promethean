export * from './lib/actions/index.js';
// Heal functionality exports (re-exported once)
export { loadKanbanConfig } from './board/config.js';
export { ScarContextBuilder, createScarContextBuilder } from './lib/heal/scar-context-builder.js';
export { GitTagManager, createGitTagManager } from './lib/heal/git-tag-manager.js';
export { ScarHistoryManager, createScarHistoryManager } from './lib/heal/scar-history-manager.js';
export { HealCommand, createHealCommand } from './lib/heal/heal-command.js';
export type {
  ScarContext,
  ScarRecord,
  HealingResult,
  HealingStatus,
  ScarContextOptions,
} from './lib/heal/scar-context-types.js';

export type { HealCommandOptions, ExtendedHealingResult } from './lib/heal/heal-command.js';

export type { Board, Task } from './lib/types.js';
