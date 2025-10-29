/**
 * Git Tag Management for Kanban Healing Operations - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { ScarRecord, GitCommit } from './scar-context-types.js';

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
      '[GitTagManager] Git functionality is disabled - no git operations will be performed',
    );
  }

  /**
   * Create a git tag for a healing event - DISABLED
   */
  async createHealingTag(
    scarId: string,
    healingType: string,
    metadata?: Record<string, unknown>,
  ): Promise<TagCreationResult> {
    console.warn('[GitTagManager] createHealingTag called but git is disabled');
    return {
      success: false,
      tag: `${this.options.tagPrefix}${healingType}/${scarId}`,
      commitSha: 'disabled',
      error: 'Git functionality is disabled',
      metadata: {
        created: new Date(),
        message: `Healing: ${healingType} for ${scarId}`,
        annotated: this.options.createAnnotatedTags,
      },
    };
  }

  /**
   * Store scar history in git - DISABLED
   */
  async storeScarHistory(scar: ScarRecord): Promise<ScarHistoryResult> {
    console.warn('[GitTagManager] storeScarHistory called but git is disabled');
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
    console.warn('[GitTagManager] getHealingHistory called but git is disabled');
    return [];
  }

  /**
   * Clean up old tags - DISABLED
   */
  async cleanupOldTags(keepCount: number = this.options.maxScarsRetained): Promise<number> {
    console.warn('[GitTagManager] cleanupOldTags called but git is disabled');
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
    const message = `Kanban Healing: ${healingType} for ${scarId}`;

    if (metadata) {
      const metadataLines = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');

      if (metadataLines) {
        message += `

Metadata:
${metadataLines}`;
      }
    }

    return message;
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
