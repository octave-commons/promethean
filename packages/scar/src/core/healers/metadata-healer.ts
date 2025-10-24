/**
 * Healer for metadata corruptions
 */

import { HealingStrategy, HealingResult, FileCorruption, ScarType } from '../../types/index.js';
import crypto from 'crypto';

export class MetadataHealer implements HealingStrategy {
  readonly name = 'MetadataHealer';
  readonly supportedTypes = [ScarType.METADATA_CORRUPTION];
  readonly priority = 70;

  canHeal(corruption: FileCorruption): boolean {
    return corruption.type === ScarType.METADATA_CORRUPTION && corruption.autoHealable;
  }

  async heal(corruption: FileCorruption, content: string): Promise<HealingResult> {
    try {
      let healedContent = content;
      const changesMade: string[] = [];

      // Fix frontmatter metadata issues
      if (healedContent.startsWith('---')) {
        healedContent = this.fixFrontmatter(healedContent, changesMade);
      }

      // Fix task metadata structure
      if (
        corruption.filePath &&
        corruption.filePath.includes('tasks/') &&
        corruption.filePath.endsWith('.md')
      ) {
        healedContent = this.fixTaskMetadata(healedContent, changesMade);
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
        errorMessage: `Failed to heal metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresManualReview: true,
      };
    }
  }

  private fixFrontmatter(content: string, changesMade: string[]): string {
    let fixed = content;

    // Extract frontmatter
    const frontmatterMatch = fixed.match(/^---\s*\n(.*?)\n---\s*\n/s);
    if (!frontmatterMatch || !frontmatterMatch[1]) return fixed;

    let frontmatter = frontmatterMatch[1];
    const restOfContent = fixed.substring(frontmatterMatch[0].length);

    // Fix common frontmatter issues
    frontmatter = this.normalizeFrontmatterQuotes(frontmatter, changesMade);
    frontmatter = this.fixRequiredFields(frontmatter, changesMade);
    frontmatter = this.fixFieldTypes(frontmatter, changesMade);

    // Reconstruct content
    fixed = `---\n${frontmatter}\n---\n${restOfContent}`;
    if (fixed !== content) {
      changesMade.push('Fixed frontmatter metadata structure');
    }

    return fixed;
  }

  private normalizeFrontmatterQuotes(frontmatter: string, changesMade: string[]): string {
    // Fix unquoted string values that should be quoted
    return frontmatter.replace(
      /^(uuid|title|slug|status|priority):\s*([^"'\s].*)$/gm,
      (match, key, value) => {
        if (!value.includes('"') && !value.includes("'")) {
          changesMade.push(`Added quotes to ${key} field`);
          return `${key}: "${value}"`;
        }
        return match;
      },
    );
  }

  private fixRequiredFields(frontmatter: string, changesMade: string[]): string {
    const requiredFields = ['uuid', 'title', 'status', 'priority'];
    let fixed = frontmatter;

    for (const field of requiredFields) {
      if (!new RegExp(`^${field}:`, 'm').test(fixed)) {
        const defaultValue = this.getDefaultValue(field);
        fixed += `\n${field}: ${defaultValue}`;
        changesMade.push(`Added missing required field: ${field}`);
      }
    }

    return fixed;
  }

  private fixFieldTypes(frontmatter: string, changesMade: string[]): string {
    let fixed = frontmatter;

    // Fix labels field to be an array
    fixed = fixed.replace(/^labels:\s*(.*)$/gm, (match, value) => {
      if (!value.startsWith('[')) {
        changesMade.push('Fixed labels field to be an array');
        return 'labels: []';
      }
      return match;
    });

    // Fix estimates field structure
    fixed = fixed.replace(/^estimates:\s*(.*)$/gm, (match, value) => {
      if (!value.includes('complexity:') && !value.includes('scale:')) {
        changesMade.push('Fixed estimates field structure');
        return 'estimates:\n  complexity: ""\n  scale: ""\n  time_to_completion: ""';
      }
      return match;
    });

    return fixed;
  }

  private fixTaskMetadata(content: string, changesMade: string[]): string {
    let fixed = content;

    // Ensure task has proper status
    if (!fixed.includes('status:')) {
      const frontmatterMatch = fixed.match(/^---\s*\n(.*?)\n---\s*\n/s);
      if (frontmatterMatch) {
        fixed = fixed.replace(
          frontmatterMatch[0],
          frontmatterMatch[0].replace('---\n', '---\nstatus: "incoming"\n'),
        );
        changesMade.push('Added missing status field to task');
      }
    }

    return fixed;
  }

  private getDefaultValue(field: string): string {
    const defaults: Record<string, string> = {
      uuid: `"${this.generateUUID()}"`,
      title: '"Untitled Task"',
      status: '"incoming"',
      priority: '"P2"',
    };
    return defaults[field] || '""';
  }

  private generateUUID(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    const bytes = crypto.randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return (
      hex.slice(0, 8) + '-' +
      hex.slice(8, 12) + '-' +
      hex.slice(12, 16) + '-' +
      hex.slice(16, 20) + '-' +
      hex.slice(20, 32)
    );
  }
}
