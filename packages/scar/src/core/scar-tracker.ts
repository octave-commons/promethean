/**
 * Scar tracking system to record healing operations
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import {
  ScarRecord,
  HealingResult,
  FileCorruption,
  Scar,
  HealingOperation,
  FileSnapshot,
  ScarType,
  ScarSeverity,
  HealingStatus,
} from '../types/index.js';

export class ScarTracker {
  private scarLogPath: string;
  private scars: Map<string, ScarRecord[]> = new Map();

  constructor(scarLogPath: string = '.scars/') {
    this.scarLogPath = scarLogPath;
  }

  async recordScar(
    filePath: string,
    corruption: FileCorruption,
    healingResult: HealingResult,
    originalContent: string,
    healedContent: string,
  ): Promise<void> {
    const scar: ScarRecord = {
      id: this.generateScarId(),
      filePath,
      timestamp: new Date().toISOString(),
      corruption: {
        type: corruption.type,
        severity: corruption.severity,
        description: corruption.description,
        autoHealable: corruption.autoHealable,
        detectedAt: corruption.detectedAt,
      },
      healing: {
        strategy: healingResult.strategy || 'unknown',
        success: healingResult.success,
        changesMade: healingResult.changesMade || [],
        requiresManualReview: healingResult.requiresManualReview || false,
        errorMessage: healingResult.errorMessage,
      },
      contentHash: this.hashContent(originalContent),
      healedContentHash: this.hashContent(healedContent),
    };

    // Store in memory
    if (!this.scars.has(filePath)) {
      this.scars.set(filePath, []);
    }
    this.scars.get(filePath)!.push(scar);

    // Persist to disk
    await this.persistScar(scar);
  }

  async getScarsForFile(filePath: string): Promise<ScarRecord[]> {
    // Return from memory if available
    if (this.scars.has(filePath)) {
      return this.scars.get(filePath)!;
    }

    // Load from disk
    try {
      const scarFile = this.getScarFilePath(filePath);
      const content = await fs.readFile(scarFile, 'utf-8');
      const scars = JSON.parse(content) as ScarRecord[];
      this.scars.set(filePath, scars);
      return scars;
    } catch (error) {
      // File doesn't exist or is invalid
      return [];
    }
  }

  async getAllScars(): Promise<Map<string, ScarRecord[]>> {
    // Load all scar files from the scar directory
    try {
      const files = await fs.readdir(this.scarLogPath);
      const allScars = new Map<string, ScarRecord[]>();

      for (const file of files) {
        if (file.endsWith('.scar.json')) {
          const filePath = this.decodeFilePathFromFilename(file);
          const scars = await this.getScarsForFile(filePath);
          allScars.set(filePath, scars);
        }
      }

      this.scars = allScars;
      return allScars;
    } catch (error) {
      // Directory doesn't exist
      return new Map();
    }
  }

  async clearScarsForFile(filePath: string): Promise<void> {
    // Remove from memory
    this.scars.delete(filePath);

    // Remove from disk
    try {
      const scarFile = this.getScarFilePath(filePath);
      await fs.unlink(scarFile);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  async generateScarReport(): Promise<string> {
    const allScars = await this.getAllScars();
    let report = '# Scar Healing Report\n\n';
    report += `Generated at: ${new Date().toISOString()}\n\n`;

    let totalScars = 0;
    let successfulHealings = 0;
    let manualReviews = 0;

    for (const [filePath, scars] of allScars) {
      totalScars += scars.length;
      successfulHealings += scars.filter((s) => s.healing.success).length;
      manualReviews += scars.filter((s) => s.healing.requiresManualReview).length;

      report += `## ${filePath}\n\n`;

      for (const scar of scars) {
        report += `### Scar ${scar.id}\n`;
        report += `- **Timestamp**: ${scar.timestamp}\n`;
        report += `- **Corruption Type**: ${scar.corruption.type}\n`;
        report += `- **Severity**: ${scar.corruption.severity}\n`;
        report += `- **Strategy**: ${scar.healing.strategy}\n`;
        report += `- **Success**: ${scar.healing.success ? '✅' : '❌'}\n`;

        if (scar.healing.changesMade.length > 0) {
          report += `- **Changes Made**:\n`;
          for (const change of scar.healing.changesMade) {
            report += `  - ${change}\n`;
          }
        }

        if (scar.healing.errorMessage) {
          report += `- **Error**: ${scar.healing.errorMessage}\n`;
        }

        if (scar.healing.requiresManualReview) {
          report += `- **⚠️ Requires Manual Review**\n`;
        }

        report += '\n';
      }
    }

    report += '## Summary\n\n';
    report += `- **Total Scars**: ${totalScars}\n`;
    report += `- **Successful Healings**: ${successfulHealings}\n`;
    report += `- **Manual Reviews Required**: ${manualReviews}\n`;
    report += `- **Success Rate**: ${totalScars > 0 ? ((successfulHealings / totalScars) * 100).toFixed(1) : 0}%\n`;

    return report;
  }

  private async persistScar(scar: ScarRecord): Promise<void> {
    try {
      // Ensure scar directory exists
      await fs.mkdir(this.scarLogPath, { recursive: true });

      const scarFile = this.getScarFilePath(scar.filePath);
      const existingScars = await this.getScarsForFile(scar.filePath);
      existingScars.push(scar);

      await fs.writeFile(scarFile, JSON.stringify(existingScars, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to persist scar:', error);
    }
  }

  private getScarFilePath(filePath: string): string {
    const filename = this.encodeFilePathToFilename(filePath);
    return join(this.scarLogPath, `${filename}.scar.json`);
  }

  private encodeFilePathToFilename(filePath: string): string {
    // Replace path separators and other problematic characters
    return filePath
      .replace(/\//g, '_')
      .replace(/\\/g, '_')
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .replace(/ /g, '-');
  }

  private decodeFilePathFromFilename(filename: string): string {
    // Reverse the encoding
    return filename
      .replace(/\.scar\.json$/, '')
      .replace(/-/g, '.')
      .replace(/_/g, '/');
  }

  private generateScarId(): string {
    return `scar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashContent(content: string): string {
    // Simple hash function for content comparison
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}
