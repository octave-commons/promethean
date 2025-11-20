/**
 * Healer for encoding corruptions
 */

import { HealingStrategy, HealingResult, FileCorruption, ScarType } from '../../types/index.js';

export class EncodingHealer implements HealingStrategy {
  readonly name = 'EncodingHealer';
  readonly supportedTypes = [ScarType.ENCODING_CORRUPTION];
  readonly priority = 95;

  canHeal(corruption: FileCorruption): boolean {
    return corruption.type === ScarType.ENCODING_CORRUPTION && corruption.autoHealable;
  }

  async heal(_corruption: FileCorruption, content: string): Promise<HealingResult> {
    try {
      let healedContent = content;
      const changesMade: string[] = [];

      // Fix common encoding issues
      if (content.includes('â€') || content.includes('â')) {
        // Fix smart quotes and em dashes
        healedContent = healedContent
          .replace(/â€/g, '"')
          .replace(/â€/g, '"')
          .replace(/â€/g, "'")
          .replace(/â€/g, "'")
          .replace(/â€"/g, '—')
          .replace(/â€"/g, '–');
        changesMade.push('Fixed smart quotes and dashes encoding');
      }

      // Fix BOM (Byte Order Mark)
      if (healedContent.charCodeAt(0) === 0xfeff) {
        healedContent = healedContent.substring(1);
        changesMade.push('Removed BOM (Byte Order Mark)');
      }

      // Fix null bytes
      if (healedContent.includes('\0')) {
        healedContent = healedContent.replace(/\0/g, '');
        changesMade.push('Removed null bytes');
      }

      // Fix control characters (except common ones)
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(healedContent)) {
        healedContent = healedContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        changesMade.push('Removed control characters');
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
        errorMessage: `Failed to heal encoding: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresManualReview: true,
      };
    }
  }
}
