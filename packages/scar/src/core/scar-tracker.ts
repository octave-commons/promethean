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
    const scarId = this.generateScarId();
    const operationId = this.generateOperationId();

    const scar: Scar = {
      id: scarId,
      filePath,
      type: corruption.type,
      severity: corruption.severity,
      status: healingResult.success ? HealingStatus.COMPLETED : HealingStatus.FAILED,
      detectedAt: corruption.detectedAt,
      healedAt: healingResult.success ? new Date() : undefined,
      healingOperationId: operationId,
      description: corruption.description,
      evidence: corruption.evidence,
      metadata: {
        autoHealable: corruption.autoHealable,
        changesMade: healingResult.changesMade || [],
        requiresManualReview: healingResult.requiresManualReview,
      },
      tags: [corruption.type, corruption.severity],
    };

    const healingOperation: HealingOperation = {
      id: operationId,
      filePath,
      corruptions: [corruption],
      status: healingResult.success ? HealingStatus.COMPLETED : HealingStatus.FAILED,
      startedAt: new Date(),
      completedAt: healingResult.success ? new Date() : undefined,
      errorMessage: healingResult.errorMessage,
      originalChecksum: this.hashContent(originalContent),
      healedChecksum: healingResult.success ? this.hashContent(healedContent) : undefined,
    };

    const beforeSnapshot: FileSnapshot = {
      filePath,
      content: originalContent,
      checksum: this.hashContent(originalContent),
      size: originalContent.length,
      encoding: 'utf-8',
      timestamp: corruption.detectedAt,
      metadata: {},
    };

    const afterSnapshot: FileSnapshot | undefined = healingResult.success
      ? {
          filePath,
          content: healedContent,
          checksum: this.hashContent(healedContent),
          size: healedContent.length,
          encoding: 'utf-8',
          timestamp: new Date(),
          metadata: {},
        }
      : undefined;

    const scarRecord: ScarRecord = {
      scar,
      healingOperation,
      beforeSnapshot,
      afterSnapshot,
      notes: healingResult.errorMessage,
    };

    // Store in memory
    if (!this.scars.has(filePath)) {
      this.scars.set(filePath, []);
    }
    this.scars.get(filePath)!.push(scarRecord);

    // Persist to disk
    await this.persistScar(scarRecord);
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
      successfulHealings += scars.filter((s) => s.scar.status === HealingStatus.COMPLETED).length;
      manualReviews += scars.filter((s) => s.scar.metadata.requiresManualReview).length;

      report += `## ${filePath}\n\n`;

      for (const scarRecord of scars) {
        const scar = scarRecord.scar;
        report += `### Scar ${scar.id}\n`;
        report += `- **Timestamp**: ${scar.detectedAt.toISOString()}\n`;
        report += `- **Corruption Type**: ${scar.type}\n`;
        report += `- **Severity**: ${scar.severity}\n`;
        report += `- **Status**: ${scar.status}\n`;

        if (scar.healingOperationId) {
          report += `- **Operation ID**: ${scar.healingOperationId}\n`;
        }

        if (scar.metadata.changesMade && scar.metadata.changesMade.length > 0) {
          report += `- **Changes Made**:\n`;
          for (const change of scar.metadata.changesMade) {
            report += `  - ${change}\n`;
          }
        }

        if (scarRecord.notes) {
          report += `- **Notes**: ${scarRecord.notes}\n`;
        }

        if (scar.metadata.requiresManualReview) {
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

  private async persistScar(scarRecord: ScarRecord): Promise<void> {
    try {
      // Ensure scar directory exists
      await fs.mkdir(this.scarLogPath, { recursive: true });

      const scarFile = this.getScarFilePath(scarRecord.scar.filePath);
      const existingScars = await this.getScarsForFile(scarRecord.scar.filePath);
      existingScars.push(scarRecord);

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
    return `scar_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
