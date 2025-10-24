/**
 * Healer for filename corruptions
 */

import { basename, dirname, extname, join } from 'path';
import { HealingStrategy, HealingResult, FileCorruption, ScarType } from '../../types/index.js';

export class FilenameHealer implements HealingStrategy {
  readonly name = 'FilenameHealer';
  readonly supportedTypes = [ScarType.FILENAME_CORRUPTION];
  readonly priority = 100;

  canHeal(corruption: FileCorruption): boolean {
    return corruption.type === ScarType.FILENAME_CORRUPTION && corruption.autoHealable;
  }

  async heal(corruption: FileCorruption, content: string): Promise<HealingResult> {
    const filePath = corruption.filePath;
    const filename = basename(filePath);
    const directory = dirname(filePath);

    try {
      let newFilename = filename;
      const changesMade: string[] = [];

      // Fix double extensions (.md.md -> .md)
      if (/^(.+)\.(md|txt|json|yaml|yml)\.(md|txt|json|yaml|yml)$/.test(filename)) {
        const match = filename.match(/^(.+)\.(md|txt|json|yaml|yml)\.(md|txt|json|yaml|yml)$/);
        if (match) {
          newFilename = `${match[1]}.${match[2]}`;
          changesMade.push(`Fixed double extension`);
        }
      }

      // Fix space and number in extensions (file 2.md -> file.md)
      if (/^(.+)\s+\d+\.(md|txt|json|yaml|yml)$/.test(filename)) {
        const match = filename.match(/^(.+)\s+\d+\.(md|txt|json|yaml|yml)$/);
        if (match) {
          newFilename = `${match[1]}.${match[2]}`;
          changesMade.push(
            `Removed space and number from extension: ${filename} -> ${newFilename}`,
          );
        }
      }

      // Fix command-line arguments in filenames
      if (/^--(title|description)\s+/.test(filename)) {
        // Extract the actual title after the flags
        const cleaned = filename.replace(/^--(title|description)\s+/, '');
        // Sanitize the filename
        newFilename = this.sanitizeFilename(cleaned);
        changesMade.push(`Removed command-line arguments: ${filename} -> ${newFilename}`);
      }

      // Fix unusual characters
      if (/[{}[\]|\\<>]/.test(filename)) {
        newFilename = this.sanitizeFilename(newFilename);
        changesMade.push(`Removed unusual characters: ${filename} -> ${newFilename}`);
      }

      // If no changes were made, return success with no changes
      if (newFilename === filename) {
        return {
          success: true,
          healedContent: content,
          changesMade: [],
          requiresManualReview: false,
        };
      }

      // Update content if it contains the old filename in frontmatter
      let healedContent = content;
      if (content.includes(filename)) {
        healedContent = content.replace(
          new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newFilename,
        );
        changesMade.push(`Updated filename references in content`);
      }

      return {
        success: true,
        healedContent,
        changesMade,
        requiresManualReview: false,
        metadata: {
          originalFilename: filename,
          newFilename,
          newFilePath: join(directory, newFilename),
        },
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: `Failed to heal filename: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresManualReview: true,
      };
    }
  }

  private sanitizeFilename(filename: string): string {
    // Remove or replace problematic characters
    let sanitized = filename
      .replace(/[{}[\]|\\<>]/g, '') // Remove unusual characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .toLowerCase(); // Convert to lowercase

    // Ensure it has a valid extension
    const hasValidExtension = /\.(md|txt|json|yaml|yml)$/i.test(sanitized);
    if (!hasValidExtension) {
      const originalExt = extname(filename);
      if (originalExt) {
        sanitized += originalExt;
      } else {
        sanitized += '.md'; // Default to .md
      }
    }

    return sanitized;
  }
}
