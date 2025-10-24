/**
 * Healer for content corruptions
 */

import { HealingStrategy, HealingResult, FileCorruption, ScarType } from '../../types/index.js';

export class ContentHealer implements HealingStrategy {
  readonly name = 'ContentHealer';
  readonly supportedTypes = [ScarType.CONTENT_CORRUPTION];
  readonly priority = 90;

  canHeal(corruption: FileCorruption): boolean {
    return corruption.type === ScarType.CONTENT_CORRUPTION && corruption.autoHealable;
  }

  async heal(corruption: FileCorruption, content: string): Promise<HealingResult> {
    try {
      let healedContent = content;
      const changesMade: string[] = [];

      // Fix repeated slash patterns (//*)
      if (/\/\/\*/.test(healedContent)) {
        healedContent = healedContent.replace(/\/\/\*/g, '//');
        changesMade.push('Fixed repeated slash patterns (//* -> //)');
      }

      // Fix excessive backslashes
      if (/\\\\{3,}/.test(healedContent)) {
        healedContent = healedContent.replace(/\\\\{3,}/g, '\\\\');
        changesMade.push('Reduced excessive backslashes to double backslashes');
      }

      // Fix excessive markdown header levels
      if (/^#{4,}/gm.test(healedContent)) {
        healedContent = healedContent.replace(/^#{4,}/gm, '###');
        changesMade.push('Reduced excessive markdown header levels to ###');
      }

      // Fix broken markdown links
      healedContent = this.fixMarkdownLinks(healedContent, changesMade);

      // Fix malformed code blocks
      healedContent = this.fixCodeBlocks(healedContent, changesMade);

      // Normalize line endings
      if (healedContent.includes('\r\n')) {
        healedContent = healedContent.replace(/\r\n/g, '\n');
        changesMade.push('Normalized Windows line endings to Unix');
      }

      // Remove trailing whitespace
      if (/[ \t]+$/gm.test(healedContent)) {
        healedContent = healedContent.replace(/[ \t]+$/gm, '');
        changesMade.push('Removed trailing whitespace');
      }

      // Ensure file ends with newline
      if (!healedContent.endsWith('\n')) {
        healedContent += '\n';
        changesMade.push('Added final newline');
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
        errorMessage: `Failed to heal content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresManualReview: true,
      };
    }
  }

  private fixMarkdownLinks(content: string, changesMade: string[]): string {
    let fixed = content;

    // Fix broken wikilinks [[file]] -> [[file]]
    fixed = fixed.replace(/\[\[([^\]]+)\]\]/g, (match, link) => {
      const cleanLink = link.trim();
      if (cleanLink !== link) {
        changesMade.push(`Fixed wikilink formatting: [[${link}]] -> [[${cleanLink}]]`);
      }
      return `[[${cleanLink}]]`;
    });

    // Fix broken markdown links [text](url) with extra spaces
    fixed = fixed.replace(/\[([^\]]+)\]\(\s*([^)]+)\s*\)/g, (match, text, url) => {
      const cleanText = text.trim();
      const cleanUrl = url.trim();
      if (cleanText !== text || cleanUrl !== url) {
        changesMade.push(
          `Fixed markdown link formatting: [${text}](${url}) -> [${cleanText}](${cleanUrl})`,
        );
      }
      return `[${cleanText}](${cleanUrl})`;
    });

    return fixed;
  }

  private fixCodeBlocks(content: string, changesMade: string[]): string {
    let fixed = content;

    // Fix unclosed code blocks
    const codeBlockCount = (fixed.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      fixed += '\n```';
      changesMade.push('Closed unclosed code block');
    }

    // Fix code blocks without language specification
    fixed = fixed.replace(/```\n/g, '```\ntext\n');
    if (fixed !== content) {
      changesMade.push('Added language specification to code blocks');
    }

    return fixed;
  }
}
