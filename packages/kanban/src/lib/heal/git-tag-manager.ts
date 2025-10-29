/**
 * Git Tag Management for Kanban Healing Operations - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { ScarRecord } from './scar-context-types.js';

/**
 * Git tag configuration options - DISABLED VERSION
 */
export interface GitTagManagerOptions {
  tagPrefix?: string;
  scarHistoryDir?: string;
  maxScarsRetained?: number;
  createAnnotatedTags?: boolean;
  signTags?: boolean;
}

/**
 * Tag creation result - DISABLED VERSION
 */
export interface TagCreationResult {
  success: boolean;
  tag: string;
  commitSha: string;
  error?: string;
  metadata: {
    created: Date;
    message: string;
    annotated: boolean;
  };
}

/**
 * Scar history storage result - DISABLED VERSION
 */
export interface ScarHistoryResult {
  success: boolean;
  scarCount: number;
  filePath: string;
  error?: string;
}

/**
 * Git tag manager for kanban healing operations - DISABLED
 *
 * This class provides no-op implementations of all git tagging functionality.
 * All methods return safe default values and log warnings about disabled git operations.
 */
export class GitTagManager {
  private repoRoot: string;
  private options: Required<GitTagManagerOptions>;

  constructor(repoRoot: string, options: GitTagManagerOptions = {}) {
    this.repoRoot = repoRoot;
    this.options = {
      tagPrefix: options.tagPrefix ?? 'kanban-heal/',
      scarHistoryDir: options.scarHistoryDir ?? '.kanban/heal',
      maxScarsRetained: options.maxScarsRetained ?? 100,
      createAnnotatedTags: options.createAnnotatedTags ?? true,
      signTags: options.signTags ?? false,
    };

    console.warn(
      `[GitTagManager] Git functionality is disabled for repo ${repoRoot} - no git operations will be performed`,
    );
  }

  /**
   * Get repository root - DISABLED
   */
  getRepositoryRoot(): string {
    return this.repoRoot;
  }

  /**
   * Create a git tag for a healing event - DISABLED
   */
  async createHealingTag(
    scarId: string,
    healingType: string,
    metadata?: Record<string, unknown>,
  ): Promise<TagCreationResult> {
    console.warn(`[GitTagManager] createHealingTag called for scar ${scarId} but git is disabled`);
    return {
      success: false,
      tag: `${this.options.tagPrefix}${healingType}/${scarId}`,
      commitSha: 'disabled',
      error: 'Git functionality is disabled',
      metadata: {
        created: new Date(),
        message: this.createTagMessage(healingType, scarId, metadata),
        annotated: this.options.createAnnotatedTags,
      },
    };
  }

  /**
   * Store scar history in git - DISABLED
   */
  async storeScarHistory(scar: ScarRecord): Promise<ScarHistoryResult> {
    console.warn(
      `[GitTagManager] storeScarHistory called for scar ${scar.tag} but git is disabled`,
    );
    return {
      success: false,
      scarCount: 0,
      filePath: 'disabled',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Get healing history from git tags - DISABLED
   */
  async getHealingHistory(scarId?: string): Promise<TagCreationResult[]> {
    console.warn(`[GitTagManager] getHealingHistory called for scar ${scarId} but git is disabled`);
    return [];
  }

  /**
   * Clean up old tags - DISABLED
   */
  async cleanupOldTags(keepCount: number = this.options.maxScarsRetained): Promise<number> {
    console.warn(
      `[GitTagManager] cleanupOldTags called with keepCount ${keepCount} but git is disabled`,
    );
    return 0;
  }

  /**
   * Validate git repository - DISABLED
   */
  async validateRepository(): Promise<boolean> {
    console.warn('[GitTagManager] validateRepository called but git is disabled');
    return false;
  }

  /**
   * Get current commit SHA - DISABLED
   */
  async getCurrentCommit(): Promise<string> {
    console.warn('[GitTagManager] getCurrentCommit called but git is disabled');
    return 'disabled';
  }

  /**
   * Create tag message - DISABLED
   */
  private createTagMessage(
    healingType: string,
    scarId: string,
    metadata?: Record<string, unknown>,
  ): string {
    const baseMessage = `Kanban Healing: ${healingType} for ${scarId}`;

    if (!metadata) {
      return baseMessage;
    }

    const metadataLines = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    if (!metadataLines) {
      return baseMessage;
    }

    return `${baseMessage}

 Metadata:
 ${metadataLines}`;
  }

  /**
   * Create heal tag - DISABLED (alias for createHealingTag)
   */
  async createHealTag(
    scarId: string,
    healingType: string,
    metadata?: Record<string, unknown>,
  ): Promise<TagCreationResult> {
    console.warn('[GitTagManager] createHealTag called but git is disabled');
    return await this.createHealingTag(scarId, healingType, metadata);
  }

  /**
   * Push tags to remote - DISABLED
   */
  async pushTags(): Promise<{ success: boolean; error?: string }> {
    console.warn('[GitTagManager] pushTags called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Store scar record - DISABLED
   */
  async storeScarRecord(scar: ScarRecord): Promise<ScarHistoryResult> {
    console.warn('[GitTagManager] storeScarRecord called but git is disabled');
    return await this.storeScarHistory(scar);
  }

  /**
   * Get commits between tags - DISABLED
   */
  async getCommitsBetweenTags(
    fromTag: string,
    toTag: string,
  ): Promise<{ sha: string; message: string; author: string; date: Date }[]> {
    console.warn(
      `[GitTagManager] getCommitsBetweenTags called from ${fromTag} to ${toTag} but git is disabled`,
    );
    return [];
  }

  /**
   * Load scar history - DISABLED
   */
  async loadScarHistory(scarId?: string): Promise<ScarRecord[]> {
    console.warn(`[GitTagManager] loadScarHistory called for scar ${scarId} but git is disabled`);
    return [];
  }

  /**
   * Get heal tags - DISABLED
   */
  async getHealTags(): Promise<TagCreationResult[]> {
    console.warn('[GitTagManager] getHealTags called but git is disabled');
    return [];
  }

  /**
   * Delete tag - DISABLED
   */
  async deleteTag(tag: string): Promise<{ success: boolean; error?: string }> {
    console.warn(`[GitTagManager] deleteTag called for tag ${tag} but git is disabled`);
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }
}

/**
 * Default git tag manager options - DISABLED
 */
export const DEFAULT_GIT_TAG_MANAGER_OPTIONS: Required<GitTagManagerOptions> = {
  tagPrefix: 'kanban-heal/',
  scarHistoryDir: '.kanban/heal',
  maxScarsRetained: 100,
  createAnnotatedTags: true,
  signTags: false,
};

/**
 * Convenience function to create a git tag manager - DISABLED
 */
export function createGitTagManager(
  repoRoot: string,
  options: GitTagManagerOptions = {},
): GitTagManager {
  console.warn('[createGitTagManager] Git functionality is disabled - returning no-op manager');
  return new GitTagManager(repoRoot, options);
}
