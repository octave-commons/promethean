/**
 * Main Scar context that coordinates detection, healing, and tracking
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { FileAnalysisResult, HealingResult, ScarRecord, ScarConfig } from '../types/index.js';
import { CorruptionDetector } from './corruption-detector.js';
import { HealingStrategyRegistry } from './healers/index.js';
import { ScarTracker } from './scar-tracker.js';

export class ScarContext {
  private detector: CorruptionDetector;
  private healerRegistry: HealingStrategyRegistry;
  private tracker: ScarTracker;
  private config: ScarConfig;

  constructor(config: Partial<ScarConfig> = {}) {
    this.config = {
      enabled: true,
      autoHeal: true,
      backupEnabled: true,
      backupDirectory: '.scar-backups/',
      maxBackupSize: 100 * 1024 * 1024, // 100MB
      corruptionPatterns: [],
      healingStrategies: [],
      scarStoragePath: '.scars/',
      logLevel: 'info',
      dryRun: false,
      ...config,
    };

    this.detector = new CorruptionDetector();
    this.healerRegistry = new HealingStrategyRegistry();
    this.tracker = new ScarTracker(this.config.scarStoragePath);
  }

  async analyzeFile(filePath: string): Promise<FileAnalysisResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      const corruptions = await this.detector.detectTaskFileCorruptions(filePath);

      return {
        filePath,
        isCorrupted: corruptions.length > 0,
        corruptions,
        fileSize: stats.size,
        encoding: 'utf-8',
        lastModified: stats.mtime,
        checksum: this.hashContent(content),
      };
    } catch (error) {
      throw new Error(
        `Failed to analyze file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async analyzeDirectory(
    dirPath: string,
    recursive: boolean = true,
  ): Promise<FileAnalysisResult[]> {
    const results: FileAnalysisResult[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isFile() && this.shouldProcessFile(fullPath)) {
          try {
            const result = await this.analyzeFile(fullPath);
            results.push(result);
          } catch (error) {
            console.error(`Failed to analyze ${fullPath}:`, error);
          }
        } else if (entry.isDirectory() && recursive) {
          try {
            const subResults = await this.analyzeDirectory(fullPath, recursive);
            results.push(...subResults);
          } catch (error) {
            console.error(`Failed to analyze directory ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to analyze directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return results;
  }

  async healFile(
    filePath: string,
    createBackup: boolean = this.config.backupEnabled,
  ): Promise<HealingResult[]> {
    const results: HealingResult[] = [];

    try {
      const analysis = await this.analyzeFile(filePath);

      if (!analysis.isCorrupted) {
        return results;
      }

      // Create backup if enabled
      let originalContent: string;
      if (createBackup) {
        originalContent = await fs.readFile(filePath, 'utf-8');
        await this.createBackup(filePath, originalContent);
      } else {
        originalContent = await fs.readFile(filePath, 'utf-8');
      }

      let currentContent = originalContent;

      // Heal each corruption
      for (const corruption of analysis.corruptions) {
        if (corruption.autoHealable && this.config.autoHeal) {
          try {
            const result = await this.healerRegistry.healCorruption(corruption, currentContent);
            results.push(result);

            if (result.success && result.healedContent) {
              currentContent = result.healedContent;

              // Record the scar
              await this.tracker.recordScar(
                filePath,
                corruption,
                result,
                originalContent,
                currentContent,
              );
            }
          } catch (error) {
            const failureResult: HealingResult = {
              success: false,
              errorMessage: `Healing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              requiresManualReview: true,
            };
            results.push(failureResult);
          }
        } else {
          const skippedResult: HealingResult = {
            success: false,
            errorMessage: corruption.autoHealable
              ? 'Auto-healing disabled'
              : 'Corruption requires manual review',
            requiresManualReview: true,
          };
          results.push(skippedResult);
        }
      }

      // Write the healed content if any healing was successful
      const hasSuccessfulHealings = results.some((r) => r.success);
      if (hasSuccessfulHealings) {
        await fs.writeFile(filePath, currentContent, 'utf-8');
      }

      return results;
    } catch (error) {
      throw new Error(
        `Failed to heal file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async healDirectory(
    dirPath: string,
    recursive: boolean = true,
  ): Promise<Map<string, HealingResult[]>> {
    const results = new Map<string, HealingResult[]>();

    const analysisResults = await this.analyzeDirectory(dirPath, recursive);

    for (const analysis of analysisResults) {
      if (analysis.isCorrupted) {
        try {
          const healResults = await this.healFile(analysis.filePath);
          results.set(analysis.filePath, healResults);
        } catch (error) {
          console.error(`Failed to heal ${analysis.filePath}:`, error);
          results.set(analysis.filePath, [
            {
              success: false,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              requiresManualReview: true,
            },
          ]);
        }
      }
    }

    return results;
  }

  async getScarsForFile(filePath: string): Promise<ScarRecord[]> {
    return this.tracker.getScarsForFile(filePath);
  }

  async getAllScars(): Promise<Map<string, ScarRecord[]>> {
    return this.tracker.getAllScars();
  }

  async generateScarReport(): Promise<string> {
    return this.tracker.generateScarReport();
  }

  async clearScarsForFile(filePath: string): Promise<void> {
    return this.tracker.clearScarsForFile(filePath);
  }

  private shouldProcessFile(filePath: string): boolean {
    // Only process text files that are likely to be corrupted
    const textExtensions = [
      '.md',
      '.txt',
      '.json',
      '.yaml',
      '.yml',
      '.toml',
      '.ini',
      '.cfg',
      '.conf',
    ];
    return textExtensions.some((ext) => filePath.endsWith(ext));
  }

  private async createBackup(filePath: string, content: string): Promise<void> {
    try {
      await fs.mkdir(this.config.backupDirectory, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${filePath.replace(/[\/\\:]/g, '_')}.${timestamp}.backup`;
      const backupPath = join(this.config.backupDirectory, filename);

      await fs.writeFile(backupPath, content, 'utf-8');
    } catch (error) {
      console.error(`Failed to create backup for ${filePath}:`, error);
    }
  }

  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}
