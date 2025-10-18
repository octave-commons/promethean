/**
 * Git Tag Management for Kanban Healing Operations
 * 
 * This module provides comprehensive git tag management capabilities for tracking
 * heal operations in the kanban system. It handles tag creation, retrieval,
 * and scar history management with proper git integration.
 */

import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { ScarRecord, GitCommit } from './scar-context-types.js';

/**
 * Git tag configuration options
 */
export interface GitTagManagerOptions {
  /** Prefix for heal operation tags */
  tagPrefix?: string;
  /** Directory to store scar history */
  scarHistoryDir?: string;
  /** Maximum number of scars to retain */
  maxScarsRetained?: number;
  /** Whether to create annotated tags */
  createAnnotatedTags?: boolean;
  /** Tag signing configuration */
  signTags?: boolean;
}

/**
 * Tag creation result
 */
export interface TagCreationResult {
  /** Whether tag creation was successful */
  success: boolean;
  /** The tag that was created */
  tag: string;
  /** The commit SHA the tag points to */
  commitSha: string;
  /** Any error message if creation failed */
  error?: string;
  /** Additional metadata about the tag */
  metadata: {
    created: Date;
    message: string;
    annotated: boolean;
  };
}

/**
 * Scar history storage result
 */
export interface ScarHistoryResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Number of scars stored */
  scarCount: number;
  /** Path to the scar history file */
  filePath: string;
  /** Any error message if operation failed */
  error?: string;
}

/**
 * Git tag manager for kanban healing operations
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
  }

  /**
   * Create a git tag for a healing operation
   */
  async createHealTag(
    reason: string,
    startSha?: string,
    metadata?: Record<string, any>
  ): Promise<TagCreationResult> {
    const timestamp = new Date();
    const date = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    const tag = `${this.options.tagPrefix}-${date}-${time}`;
    const message = this.generateTagMessage(reason, metadata);
    
    try {
      // Ensure we're in a git repository
      await this.validateGitRepository();
      
      // Get current HEAD if no start SHA provided
      const commitSha = startSha || await this.getCurrentHeadSha();
      if (!commitSha) {
        throw new Error('Unable to determine commit SHA for tagging');
      }

      // Create the tag
      if (this.options.createAnnotatedTags) {
        await this.createAnnotatedTag(tag, commitSha, message);
      } else {
        await this.createLightweightTag(tag, commitSha);
      }

      return {
        success: true,
        tag,
        commitSha,
        metadata: {
          created: timestamp,
          message,
          annotated: this.options.createAnnotatedTags,
        },
      };

    } catch (error) {
      return {
        success: false,
        tag,
        commitSha: startSha || '',
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          created: timestamp,
          message,
          annotated: this.options.createAnnotatedTags,
        },
      };
    }
  }

  /**
   * Store a scar record in the history
   */
  async storeScarRecord(scar: ScarRecord): Promise<ScarHistoryResult> {
    try {
      // Ensure scar history directory exists
      await fs.mkdir(this.scarHistoryPath, { recursive: true });

      // Load existing scars
      const existingScars = await this.loadScarHistory();
      
      // Add new scar
      existingScars.push(scar);

      // Sort by timestamp (newest first) and limit
      const sortedScars = existingScars
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.options.maxScarsRetained);

      // Write back to file
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      await fs.writeFile(
        scarFile,
        JSON.stringify(sortedScars, null, 2),
        'utf8'
      );

      return {
        success: true,
        scarCount: sortedScars.length,
        filePath: scarFile,
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
   * Load scar history from storage
   */
  async loadScarHistory(): Promise<ScarRecord[]> {
    try {
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      const data = await fs.readFile(scarFile, 'utf8');
      const scars = JSON.parse(data);
      
      // Validate and convert timestamps
      return scars
        .filter((scar: any) => scar && typeof scar === 'object')
        .map((scar: any) => ({
          ...scar,
          timestamp: new Date(scar.timestamp),
        }))
        .filter((scar: ScarRecord) => !isNaN(scar.timestamp.getTime()));

    } catch (error) {
      // File doesn't exist or is invalid - return empty array
      return [];
    }
  }

  /**
   * Get all heal tags from the repository
   */
  async getHealTags(): Promise<string[]> {
    try {
      await this.validateGitRepository();
      
      const { execSync } = await import('node:child_process');
      const tagOutput = execSync(
        `git tag --sort=-version:refname "${this.options.tagPrefix}-*"`,
        { cwd: this.repoRoot, encoding: 'utf8' }
      );
      
      return tagOutput
        .trim()
        .split('\n')
        .filter(tag => tag.trim().length > 0);

    } catch (error) {
      return [];
    }
  }

  /**
   * Get commits between two tags (for scar range)
   */
  async getCommitsBetweenTags(startTag: string, endTag?: string): Promise<GitCommit[]> {
    try {
      await this.validateGitRepository();
      
      const { execSync } = await import('node:child_process');
      const range = endTag ? `${startTag}..${endTag}` : `${startTag}..HEAD`;
      
      const logOutput = execSync(
        `git log --format="%H|%an|%ai|%s" ${range}`,
        { cwd: this.repoRoot, encoding: 'utf8' }
      );
      
      const commits: GitCommit[] = [];
      const lines = logOutput.trim().split('\n');
      
      for (const line of lines) {
        if (line.trim().length === 0) continue;
        
        const [sha, author, timestamp, ...messageParts] = line.split('|');
        const message = messageParts.join('|');
        
        commits.push({
          sha,
          message,
          author,
          timestamp: new Date(timestamp),
          files: await this.getCommitFiles(sha),
        });
      }
      
      return commits;

    } catch (error) {
      return [];
    }
  }

  /**
   * Get detailed information about a tag
   */
  async getTagInfo(tag: string): Promise<{
    commit: string;
    message: string;
    author: string;
    timestamp: Date;
  } | null> {
    try {
      await this.validateGitRepository();
      
      const { execSync } = await import('node:child_process');
      const showOutput = execSync(
        `git show -s --format="%H|%an|%ai|%B" ${tag}`,
        { cwd: this.repoRoot, encoding: 'utf8' }
      );
      
      const [commit, author, timestamp, ...messageParts] = showOutput.split('|');
      const message = messageParts.join('|');
      
      return {
        commit,
        author,
        timestamp: new Date(timestamp),
        message: message.trim(),
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a tag (for cleanup or rollback)
   */
  async deleteTag(tag: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.validateGitRepository();
      
      const { execSync } = await import('node:child_process');
      execSync(`git tag -d ${tag}`, { cwd: this.repoRoot });
      
      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Push tags to remote repository
   */
  async pushTags(tags?: string[]): Promise<{ success: boolean; pushed: string[]; error?: string }> {
    try {
      await this.validateGitRepository();
      
      const { execSync } = await import('node:child_process');
      const tagList = tags && tags.length > 0 ? tags.join(' ') : '--tags';
      
      execSync(`git push origin ${tagList}`, { cwd: this.repoRoot });
      
      const pushedTags = tags || await this.getHealTags();
      
      return { success: true, pushed: pushedTags };

    } catch (error) {
      return {
        success: false,
        pushed: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Clean up old scar records (retention management)
   */
  async cleanupOldScars(): Promise<{ removed: number; remaining: number }> {
    const scars = await this.loadScarHistory();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Keep 6 months

    const recentScars = scars.filter(scar => scar.timestamp > cutoffDate);
    const removedCount = scars.length - recentScars.length;

    if (removedCount > 0) {
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      await fs.writeFile(
        scarFile,
        JSON.stringify(recentScars, null, 2),
        'utf8'
      );
    }

    return { removed: removedCount, remaining: recentScars.length };
  }

  /**
   * Validate that we're in a git repository
   */
  private async validateGitRepository(): Promise<void> {
    try {
      const { execSync } = await import('node:child_process');
      execSync('git rev-parse --git-dir', { cwd: this.repoRoot, stdio: 'ignore' });
    } catch (error) {
      throw new Error(`Not a git repository: ${this.repoRoot}`);
    }
  }

  /**
   * Get current HEAD commit SHA
   */
  private async getCurrentHeadSha(): Promise<string | null> {
    try {
      const { execSync } = await import('node:child_process');
      const sha = execSync('git rev-parse HEAD', { cwd: this.repoRoot, encoding: 'utf8' });
      return sha.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Create an annotated git tag
   */
  private async createAnnotatedTag(tag: string, commitSha: string, message: string): Promise<void> {
    const { execSync } = await import('node:child_process');
    const signFlag = this.options.signTags ? '-s' : '-a';
    execSync(
      `git tag ${signFlag} ${tag} ${commitSha} -m "${message.replace(/"/g, '\\"')}"`,
      { cwd: this.repoRoot }
    );
  }

  /**
   * Create a lightweight git tag
   */
  private async createLightweightTag(tag: string, commitSha: string): Promise<void> {
    const { execSync } = await import('node:child_process');
    execSync(`git tag ${tag} ${commitSha}`, { cwd: this.repoRoot });
  }

  /**
   * Get files changed in a commit
   */
  private async getCommitFiles(sha: string): Promise<string[]> {
    try {
      const { execSync } = await import('node:child_process');
      const showOutput = execSync(
        `git show --name-only --format="" ${sha}`,
        { cwd: this.repoRoot, encoding: 'utf8' }
      );
      
      return showOutput
        .trim()
        .split('\n')
        .filter(file => file.trim().length > 0);

    } catch (error) {
      return [];
    }
  }

  /**
   * Generate a tag message from reason and metadata
   */
  private generateTagMessage(reason: string, metadata?: Record<string, any>): string {
    let message = `Kanban heal operation: ${reason}`;
    
    if (metadata) {
      const metadataLines = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');
      
      if (metadataLines) {
        message += `\n\nMetadata:\n${metadataLines}`;
      }
    }
    
    return message;
  }
}

/**
 * Convenience function to create a git tag manager
 */
export function createGitTagManager(repoRoot: string, options?: GitTagManagerOptions): GitTagManager {
  return new GitTagManager(repoRoot, options);
}

/**
 * Default options for git tag management
 */
export const DEFAULT_GIT_TAG_MANAGER_OPTIONS: Required<GitTagManagerOptions> = {
  tagPrefix: 'heal',
  scarHistoryDir: '.kanban/scars',
  maxScarsRetained: 50,
  createAnnotatedTags: true,
  signTags: false,
};