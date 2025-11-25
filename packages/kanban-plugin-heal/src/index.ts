import type { Command } from 'commander';
import type { PluginMeta, PluginRegistryEntry } from '@promethean-os/kanban-sdk';
import {
  GitTagManager,
  createGitTagManager,
  DEFAULT_GIT_TAG_MANAGER_OPTIONS,
  type GitTagManagerOptions,
  type TagCreationResult,
  type ScarHistoryResult,
} from './git-tag-manager.js';
import type { ScarRecord, GitCommit } from './types.js';

export const healPluginMeta: PluginMeta = {
  name: '@promethean-os/kanban-plugin-heal',
  kind: 'heal',
  description: 'Git tagging and scar history support for Kanban healing operations',
};

export const healPlugin: PluginRegistryEntry<typeof createGitTagManager> = {
  meta: healPluginMeta,
  factory: createGitTagManager,
};

/**
 * Optional CLI extension hook for the Kanban CLI.
 * Currently a no-op placeholder; future scar/heal subcommands can be registered here.
 */
export async function registerCli(_opts: {
  program: Command;
  context: unknown;
  execute: (command: string, args: string[]) => Promise<unknown>;
  jsonRequested: boolean;
}): Promise<void> {
  // placeholder for future CLI subcommands (heal/scar tools)
  return Promise.resolve();
}

export {
  GitTagManager,
  createGitTagManager,
  DEFAULT_GIT_TAG_MANAGER_OPTIONS,
  type GitTagManagerOptions,
  type TagCreationResult,
  type ScarHistoryResult,
  type ScarRecord,
  type GitCommit,
};
