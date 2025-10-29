/**
 * Git Tag Management for Kanban Healing Operations - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
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
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitTagManager {
  private readonly repoRoot: string;
  private readonly options: Required<GitTagManagerOptions>;
  private readonly scarHistoryPath: string;

  constructor(repoRoot: string, options: GitTagManagerOptions = {}) {
    this.repoRoot = repoRoot;
    this.options = {
      tagPrefix: options.tagPrefix || 'heal',
      scarHistoryDir: options.scarHistoryDir || '.kanban/scars',
      maxScarsRetained: options.maxScarsRetained || 50,
      createAnnotatedTags: options.createAnnotatedTags ?? true,
      signTags: options.signTags ?? false,
    };
    this.scarHistoryPath = path.join(this.repoRoot, this.options.scarHistoryDir);
    console.warn('[kanban-dev] Git tag manager is DISABLED - no git operations will be performed');
  }

  /**
   * Create a git tag for a healing operation - DISABLED
   */
  async createHealTag(
    reason: string,
    startSha?: string,
    metadata?: Record<string, any>,
  ): Promise<TagCreationResult> {
    console.warn(`[kanban-dev] Heal tag creation skipped for "${reason}" - git functionality disabled`);
    const timestamp = new Date();
    const date = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toTimeString() || '00:00:00';
    const time = (timeStr.split(' ')[0] || '00-00-00').replace(/:/g, '-');
    const tag = `${this.options.tagPrefix}-${date}-${time}`;

    return {
      success: false,
      tag,
      commitSha: startSha || 'disabled',
      error: 'Git functionality disabled',
      metadata: {
        created: timestamp,
        message: this.generateTagMessage(reason, metadata),
        annotated: this.options.createAnnotatedTags,
      },
    };
  }

  /**
   * Store a scar record in history - DISABLED
   */
  async storeScarRecord(scar: ScarRecord): Promise<ScarHistoryResult> {
    console.warn(`[kanban-dev] Scar record storage skipped for ${scar.metadata.tag} - git functionality disabled`);
    try {
      await fs.mkdir(this.scarHistoryPath, { recursive: true });
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      return {
        success: false,
        scarCount: 0,
        filePath: scarFile,
        error: 'Git functionality disabled',
      };
    } catch (error) {
      return {
        success: false,
        scarCount: 0,
        filePath: path.join(this.scarHistoryPath, 'scars.json'),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load scar history from storage - DISABLED
   */
  async loadScarHistory(): Promise<ScarRecord[]> {
    console.warn('[kanban-dev] Scar history loading skipped - git functionality disabled');
    try {
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      const data = await fs.readFile(scarFile, 'utf8');
      const scars = JSON.parse(data);

      return scars
        .filter((scar: any) => scar && typeof scar === 'object')
        .map((scar: any) => ({
          ...scar,
          timestamp: new Date(scar.timestamp),
        }))
        .filter((scar: ScarRecord) => !isNaN(scar.timestamp.getTime()));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all heal tags from repository - DISABLED
   */
  async getHealTags(): Promise<string[]> {
    console.warn('[kanban-dev] Heal tags retrieval skipped - git functionality disabled');
    return [];
  }

  /**
   * Get commits between two tags (for scar range) - DISABLED
   */
  async getCommitsBetweenTags(startTag: string, endTag?: string): Promise<GitCommit[]> {
    console.warn(`[kanban-dev] Commits between tags retrieval skipped (${startTag}..${endTag || 'HEAD'}) - git functionality disabled`);
    return [];
  }

  /**
   * Get detailed information about a tag - DISABLED
   */
  async getTagInfo(tag: string): Promise<{
    commit: string;
    message: string;
    author: string;
    timestamp: Date;
  } | null> {
    console.warn(`[kanban-dev] Tag info retrieval skipped for ${tag} - git functionality disabled`);
    return null;
  }

  /**
   * Delete a tag (for cleanup or rollback) - DISABLED
   */
  async deleteTag(tag: string): Promise<{ success: boolean; error?: string }> {
    console.warn(`[kanban-dev] Tag deletion skipped for ${tag} - git functionality disabled`);
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Push tags to remote repository - DISABLED
   */
  async pushTags(tags?: string[]): Promise<{ success: boolean; pushed: string[]; error?: string }> {
    console.warn(`[kanban-dev] Tag push skipped - git functionality disabled`);
    return {
      success: false,
      pushed: [],
      error: 'Git functionality disabled',
    };
  }

  /**
   * Clean up old scar records (retention management) - DISABLED
   */
  async cleanupOldScars(): Promise<{ removed: number; remaining: number }> {
    console.warn('[kanban-dev] Scar cleanup skipped - git functionality disabled');
    return { removed: 0, remaining: 0 };
  }

  /**
   * Validate that we're in a git repository - DISABLED
   */
  private async validateGitRepository(): Promise<void> {
    console.warn('[kanban-dev] Git repository validation skipped - functionality disabled');
    throw new Error('Git functionality disabled');
  }

  /**
   * Get current HEAD commit SHA - DISABLED
   */
  private async getCurrentHeadSha(): Promise<string | null> {
    console.warn('[kanban-dev] Current HEAD SHA retrieval skipped - git functionality disabled');
    return null;
  }

  /**
   * Create an annotated git tag - DISABLED
   */
  private async createAnnotatedTag(tag: string, commitSha: string, message: string): Promise<void> {
    console.warn(`[kanban-dev] Annotated tag creation skipped for ${tag} - git functionality disabled`);
  }

  /**
   * Create a lightweight git tag - DISABLED
   */
  private async createLightweightTag(tag: string, commitSha: string): Promise<void> {
    console.warn(`[kanban-dev] Lightweight tag creation skipped for ${tag} - git functionality disabled`);
  }

  /**
   * Get files changed in a commit - DISABLED
   */
  private async getCommitFiles(sha: string): Promise<string[]> {
    console.warn(`[kanban-dev] Commit files retrieval skipped for ${sha} - git functionality disabled`);
    return [];
  }

  /**
   * Generate a tag message from reason and metadata - DISABLED
   */
  private generateTagMessage(reason: string, metadata?: Record<string, any>): string {
    let message = `Kanban heal operation: ${reason}`;

    if (metadata) {
      const metadataLines = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('
');

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
 * Convenience function to create a git tag manager - DISABLED
 */
export function createGitTagManager(
  repoRoot: string,
  options?: GitTagManagerOptions,
): GitTagManager {
  console.warn('[kanban-dev] Git tag manager creation skipped - functionality disabled');
  return new GitTagManager(repoRoot, options);
}

/**
 * Default options for git tag management - DISABLED
 */
export const DEFAULT_GIT_TAG_MANAGER_OPTIONS: Required<GitTagManagerOptions> = {
  tagPrefix: 'heal',
  scarHistoryDir: '.kanban/scars',
  maxScarsRetained: 50,
  createAnnotatedTags: true,
  signTags: false,
};/**
 * Git Tag Management for Kanban Healing Operations - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
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
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitTagManager {
  private readonly repoRoot: string;
  private readonly options: Required<GitTagManagerOptions>;
  private readonly scarHistoryPath: string;

  constructor(repoRoot: string, options: GitTagManagerOptions = {}) {
    this.repoRoot = repoRoot;
    this.options = {
      tagPrefix: options.tagPrefix || 'heal',
      scarHistoryDir: options.scarHistoryDir || '.kanban/scars',
      maxScarsRetained: options.maxScarsRetained || 50,
      createAnnotatedTags: options.createAnnotatedTags ?? true,
      signTags: options.signTags ?? false,
    };
    this.scarHistoryPath = path.join(this.repoRoot, this.options.scarHistoryDir);
    console.warn('[kanban-dev] Git tag manager is DISABLED - no git operations will be performed');
  }

  /**
   * Create a git tag for a healing operation - DISABLED
   */
  async createHealTag(
    reason: string,
    startSha?: string,
    metadata?: Record<string, any>,
  ): Promise<TagCreationResult> {
    console.warn(`[kanban-dev] Heal tag creation skipped for "${reason}" - git functionality disabled`);
    const timestamp = new Date();
    const date = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toTimeString() || '00:00:00';
    const time = (timeStr.split(' ')[0] || '00-00-00').replace(/:/g, '-');
    const tag = `${this.options.tagPrefix}-${date}-${time}`;

    return {
      success: false,
      tag,
      commitSha: startSha || 'disabled',
      error: 'Git functionality disabled',
      metadata: {
        created: timestamp,
        message: this.generateTagMessage(reason, metadata),
        annotated: this.options.createAnnotatedTags,
      },
    };
  }

  /**
   * Store a scar record in history - DISABLED
   */
  async storeScarRecord(scar: ScarRecord): Promise<ScarHistoryResult> {
    console.warn(`[kanban-dev] Scar record storage skipped for ${scar.metadata.tag} - git functionality disabled`);
    try {
      await fs.mkdir(this.scarHistoryPath, { recursive: true });
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      return {
        success: false,
        scarCount: 0,
        filePath: scarFile,
        error: 'Git functionality disabled',
      };
    } catch (error) {
      return {
        success: false,
        scarCount: 0,
        filePath: path.join(this.scarHistoryPath, 'scars.json'),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load scar history from storage - DISABLED
   */
  async loadScarHistory(): Promise<ScarRecord[]> {
    console.warn('[kanban-dev] Scar history loading skipped - git functionality disabled');
    try {
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      const data = await fs.readFile(scarFile, 'utf8');
      const scars = JSON.parse(data);

      return scars
        .filter((scar: any) => scar && typeof scar === 'object')
        .map((scar: any) => ({
          ...scar,
          timestamp: new Date(scar.timestamp),
        }))
        .filter((scar: ScarRecord) => !isNaN(scar.timestamp.getTime()));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all heal tags from repository - DISABLED
   */
  async getHealTags(): Promise<string[]> {
    console.warn('[kanban-dev] Heal tags retrieval skipped - git functionality disabled');
    return [];
  }

  /**
   * Get commits between two tags (for scar range) - DISABLED
   */
  async getCommitsBetweenTags(startTag: string, endTag?: string): Promise<GitCommit[]> {
    console.warn(`[kanban-dev] Commits between tags retrieval skipped (${startTag}..${endTag || 'HEAD'}) - git functionality disabled`);
    return [];
  }

  /**
   * Get detailed information about a tag - DISABLED
   */
  async getTagInfo(tag: string): Promise<{
    commit: string;
    message: string;
    author: string;
    timestamp: Date;
  } | null> {
    console.warn(`[kanban-dev] Tag info retrieval skipped for ${tag} - git functionality disabled`);
    return null;
  }

  /**
   * Delete a tag (for cleanup or rollback) - DISABLED
   */
  async deleteTag(tag: string): Promise<{ success: boolean; error?: string }> {
    console.warn(`[kanban-dev] Tag deletion skipped for ${tag} - git functionality disabled`);
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Push tags to remote repository - DISABLED
   */
  async pushTags(tags?: string[]): Promise<{ success: boolean; pushed: string[]; error?: string }> {
    console.warn(`[kanban-dev] Tag push skipped - git functionality disabled`);
    return {
      success: false,
      pushed: [],
      error: 'Git functionality disabled',
    };
  }

  /**
   * Clean up old scar records (retention management) - DISABLED
   */
  async cleanupOldScars(): Promise<{ removed: number; remaining: number }> {
    console.warn('[kanban-dev] Scar cleanup skipped - git functionality disabled');
    return { removed: 0, remaining: 0 };
  }

  /**
   * Validate that we're in a git repository - DISABLED
   */
  private async validateGitRepository(): Promise<void> {
    console.warn('[kanban-dev] Git repository validation skipped - functionality disabled');
    throw new Error('Git functionality disabled');
  }

  /**
   * Get current HEAD commit SHA - DISABLED
   */
  private async getCurrentHeadSha(): Promise<string | null> {
    console.warn('[kanban-dev] Current HEAD SHA retrieval skipped - git functionality disabled');
    return null;
  }

  /**
   * Create an annotated git tag - DISABLED
   */
  private async createAnnotatedTag(tag: string, commitSha: string, message: string): Promise<void> {
    console.warn(`[kanban-dev] Annotated tag creation skipped for ${tag} - git functionality disabled`);
  }

  /**
   * Create a lightweight git tag - DISABLED
   */
  private async createLightweightTag(tag: string, commitSha: string): Promise<void> {
    console.warn(`[kanban-dev] Lightweight tag creation skipped for ${tag} - git functionality disabled`);
  }

  /**
   * Get files changed in a commit - DISABLED
   */
  private async getCommitFiles(sha: string): Promise<string[]> {
    console.warn(`[kanban-dev] Commit files retrieval skipped for ${sha} - git functionality disabled`);
    return [];
  }

  /**
   * Generate a tag message from reason and metadata - DISABLED
   */
  private generateTagMessage(reason: string, metadata?: Record<string, any>): string {
    let message = `Kanban heal operation: ${reason}`;

    if (metadata) {
      const metadataLines = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('
');

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
 * Convenience function to create a git tag manager - DISABLED
 */
export function createGitTagManager(
  repoRoot: string,
  options?: GitTagManagerOptions,
): GitTagManager {
  console.warn('[kanban-dev] Git tag manager creation skipped - functionality disabled');
  return new GitTagManager(repoRoot, options);
}

/**
 * Default options for git tag management - DISABLED
 */
export const DEFAULT_GIT_TAG_MANAGER_OPTIONS: Required<GitTagManagerOptions> = {
  tagPrefix: 'heal',
  scarHistoryDir: '.kanban/scars',
  maxScarsRetained: 50,
  createAnnotatedTags: true,
  signTags: false,
};