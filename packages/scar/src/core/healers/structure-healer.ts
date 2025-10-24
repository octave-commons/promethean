/**
 * Healer for structural corruptions
 */

import { HealingStrategy, HealingResult, FileCorruption, ScarType } from '../../types/index.js';
import * as crypto from 'crypto';

export class StructureHealer implements HealingStrategy {
  readonly name = 'StructureHealer';
  readonly supportedTypes = [ScarType.STRUCTURE_CORRUPTION];
  readonly priority = 80;

  canHeal(corruption: FileCorruption): boolean {
    return corruption.type === ScarType.STRUCTURE_CORRUPTION && corruption.autoHealable;
  }

  async heal(corruption: FileCorruption, content: string): Promise<HealingResult> {
    try {
      let healedContent = content;
      const changesMade: string[] = [];

      // Add frontmatter to markdown files if missing
      if (corruption.filePath.endsWith('.md') && !healedContent.startsWith('---')) {
        const uuid = this.generateUUID();
        const title =
          this.extractTitleFromContent(healedContent, corruption.filePath) || 'Untitled Task';
        const slug = this.generateSlug(title);

        const frontmatter = `---
uuid: "${uuid}"
title: "${title}"
slug: "${slug}"
status: "incoming"
priority: "P2"
labels: []
created_at: "${new Date().toISOString()}"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

`;

        healedContent = frontmatter + healedContent;
        changesMade.push('Added missing frontmatter');
      }

      // Fix malformed frontmatter
      if (healedContent.startsWith('---')) {
        const frontmatterMatch = healedContent.match(/^---\s*\n(.*?)\n---\s*\n/s);
        if (!frontmatterMatch) {
          // Try to fix unclosed frontmatter
          const firstLineEnd = healedContent.indexOf('\n');
          if (firstLineEnd > 0) {
            healedContent = '---\n' + healedContent.substring(firstLineEnd + 1);
            changesMade.push('Fixed malformed frontmatter opening');
          }
        }
      }

      return {
        success: true,
        healedContent,
        changesMade,
        requiresManualReview: false,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: `Failed to heal structure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresManualReview: true,
      };
    }
  }

  private generateUUID(): string {
    // Use Node.js crypto to generate a RFC-compliant, CSPRNG UUID
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    } else {
      // Fallback for older Node.js: generate UUID v4 manually from crypto.randomBytes
      const bytes = crypto.randomBytes(16);
      // Per RFC 4122: set version and variant bits
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
      return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32)
      ].join('-');
    }
  }

  private extractTitleFromContent(content: string, filePath: string): string | null {
    // Try to extract title from first # header
    const headerMatch = content.match(/^#\s+(.+)$/m);
    if (headerMatch && headerMatch[1]) {
      return headerMatch[1].trim();
    }

    // Try to extract from filename
    const filename = filePath.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.(md|txt|json|yaml|yml)$/i, '');
    return nameWithoutExt || null;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
