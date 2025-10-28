/**
 * Core constants for the Kanban system
 */

export const STOPWORDS = new Set<string>([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'into',
  'using',
  'your',
  'their',
  'about',
  'after',
  'before',
  'into',
  'onto',
  'under',
  'over',
  'todo',
  'task',
  'auto',
]);

export const BLOCKED_BY_HEADING = '## Blocked By';
export const BLOCKS_HEADING = '## Blocks';

export const NOW_ISO = (): string => new Date().toISOString();
