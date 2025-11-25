/**
 * Git Tag Management for Kanban Healing Operations
 *
 * Provides git tag creation, retrieval, and scar history storage for heal workflows.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ScarRecord, GitCommit } from './types.js';

export interface GitTagManagerOptions {
  tagPrefix?: string;
  scarHistoryDir?: string;
  maxScarsRetained?: number;
  createAnnotatedTags?: boolean;
  signTags?: boolean;
}

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

export interface ScarHistoryResult {
  success: boolean;
  scarCount: number;
  filePath: string;
  error?: string;
}

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

  async createHealTag(
    reason: string,
    startSha?: string,
    metadata?: Record<string, any>,
  ): Promise<TagCreationResult> {
    const timestamp = new Date();
    const [isoDate, isoTimeRaw] = timestamp.toISOString().split('T');
    const sanitizedTime = (isoTimeRaw ?? '00:00:00.000Z').replace(/[:.Z]/g, '-');

    const tag = `${this.options.tagPrefix}-${isoDate}-${sanitizedTime}`;
    const message = this.generateTagMessage(reason, metadata);

    try {
      await this.validateGitRepository();

      const commitSha = startSha || (await this.getCurrentHeadSha());
      if (!commitSha) {
        throw new Error('Unable to determine commit SHA for tagging');
      }

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

  async storeScarRecord(scar: ScarRecord): Promise<ScarHistoryResult> {
    try {
      await fs.mkdir(this.scarHistoryPath, { recursive: true });
      const existingScars = await this.loadScarHistory();
      existingScars.push(scar);

      const sortedScars = existingScars
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.options.maxScarsRetained);

      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      await fs.writeFile(scarFile, JSON.stringify(sortedScars, null, 2), 'utf8');

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

  async loadScarHistory(): Promise<ScarRecord[]> {
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
        .filter((scar: ScarRecord) => !Number.isNaN(scar.timestamp.getTime()));
    } catch {
      return [];
    }
  }

  async getHealTags(): Promise<string[]> {
    try {
      await this.validateGitRepository();
      const { execSync } = await import('node:child_process');
      const tagOutput = execSync(
        `git tag --list --sort=-version:refname "${this.options.tagPrefix}-*"`,
        {
          cwd: this.repoRoot,
          encoding: 'utf8',
        },
      );

      return tagOutput
        .trim()
        .split('\n')
        .filter((tag) => tag.trim().length > 0);
    } catch {
      return [];
    }
  }

  async getCommitsBetweenTags(startTag: string, endTag?: string): Promise<GitCommit[]> {
    try {
      await this.validateGitRepository();
      const { execSync } = await import('node:child_process');
      const range = endTag ? `${startTag}..${endTag}` : `${startTag}..HEAD`;

      const logOutput = execSync(`git log --format="%H|%an|%ai|%s" ${range}`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
      });

      const commits: GitCommit[] = [];
      const lines = logOutput.trim().split('\n');

      for (const line of lines) {
        if (line.trim().length === 0) continue;
        const [sha, author, timestamp, ...messageParts] = line.split('|');
        const message = messageParts.join('|');

        commits.push({
          sha: sha || '',
          message: message || '',
          author: author || '',
          timestamp: new Date(timestamp || Date.now()),
          files: await this.getCommitFiles(sha || ''),
        });
      }

      return commits;
    } catch {
      return [];
    }
  }

  async getTagInfo(tag: string): Promise<{
    commit: string;
    message: string;
    author: string;
    timestamp: Date;
  } | null> {
    try {
      await this.validateGitRepository();
      const { execSync } = await import('node:child_process');
      const showOutput = execSync(`git show -s --format="%H|%an|%ai|%B" ${tag}`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
      });

      const [commit, author, timestamp, ...messageParts] = showOutput.split('|');
      const message = messageParts.join('|');

      return {
        commit: commit || '',
        author: author || '',
        timestamp: new Date(timestamp || Date.now()),
        message: (message || '').trim(),
      };
    } catch {
      return null;
    }
  }

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

  async pushTags(tags?: string[]): Promise<{ success: boolean; pushed: string[]; error?: string }> {
    try {
      await this.validateGitRepository();
      const { execSync } = await import('node:child_process');
      const tagList = tags && tags.length > 0 ? tags.join(' ') : '--tags';
      execSync(`git push origin ${tagList}`, { cwd: this.repoRoot });
      const pushedTags = tags || (await this.getHealTags());
      return { success: true, pushed: pushedTags };
    } catch (error) {
      return {
        success: false,
        pushed: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async cleanupOldScars(): Promise<{ removed: number; remaining: number }> {
    const scars = await this.loadScarHistory();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6);

    const recentScars = scars.filter((scar) => scar.timestamp > cutoffDate);
    const removedCount = scars.length - recentScars.length;

    if (removedCount > 0) {
      const scarFile = path.join(this.scarHistoryPath, 'scars.json');
      await fs.writeFile(scarFile, JSON.stringify(recentScars, null, 2), 'utf8');
    }

    return { removed: removedCount, remaining: recentScars.length };
  }

  private async validateGitRepository(): Promise<void> {
    const { execSync } = await import('node:child_process');
    try {
      execSync('git rev-parse --git-dir', { cwd: this.repoRoot, stdio: 'ignore' });
    } catch {
      throw new Error(`Not a git repository: ${this.repoRoot}`);
    }
  }

  private async getCurrentHeadSha(): Promise<string | null> {
    try {
      const { execSync } = await import('node:child_process');
      const sha = execSync('git rev-parse HEAD', { cwd: this.repoRoot, encoding: 'utf8' });
      return sha.trim();
    } catch {
      return null;
    }
  }

  private async createAnnotatedTag(tag: string, commitSha: string, message: string): Promise<void> {
    const { execSync } = await import('node:child_process');
    const signFlag = this.options.signTags ? '-s' : '-a';
    execSync(`git tag ${signFlag} ${tag} ${commitSha} -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: this.repoRoot,
    });
  }

  private async createLightweightTag(tag: string, commitSha: string): Promise<void> {
    const { execSync } = await import('node:child_process');
    execSync(`git tag ${tag} ${commitSha}`, { cwd: this.repoRoot });
  }

  private async getCommitFiles(sha: string): Promise<string[]> {
    try {
      const { execSync } = await import('node:child_process');
      const showOutput = execSync(`git show --name-only --format="" ${sha}`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
      });

      return showOutput
        .trim()
        .split('\n')
        .filter((file) => file.trim().length > 0);
    } catch {
      return [];
    }
  }

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

export function createGitTagManager(
  repoRoot: string,
  options?: GitTagManagerOptions,
): GitTagManager {
  return new GitTagManager(repoRoot, options);
}

export const DEFAULT_GIT_TAG_MANAGER_OPTIONS: Required<GitTagManagerOptions> = {
  tagPrefix: 'heal',
  scarHistoryDir: '.kanban/scars',
  maxScarsRetained: 50,
  createAnnotatedTags: true,
  signTags: false,
};
