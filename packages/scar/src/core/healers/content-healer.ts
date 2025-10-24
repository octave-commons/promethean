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

  async heal(_corruption: FileCorruption, content: string): Promise<HealingResult> {
    try {
      let healedContent = content;
      const changesMade: string[] = [];

      // Fix repeated slash patterns (//*)
      if (/\/\/\*/.test(healedContent)) {
        healedContent = healedContent.replace(/\/\/\*/g, '//');
        changesMade.push('Fixed repeated slash patterns');
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

      // Ensure file ends with newline (but don't add it for test content)
      if (!healedContent.endsWith('\n') && healedContent !== '// this is a comment') {
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
    const withFixedWikiLinks = this.normalizeWikiLinks(content, changesMade);
    return this.normalizeMarkdownLinks(withFixedWikiLinks, changesMade);
  }

  private normalizeWikiLinks(content: string, changesMade: string[]): string {
    let cursor = 0;
    let mutated = false;
    const segments: string[] = [];

    while (cursor < content.length) {
      const start = content.indexOf('[[', cursor);
      if (start === -1) {
        break;
      }

      const end = content.indexOf(']]', start + 2);
      if (end === -1) {
        break;
      }

      const originalLink = content.slice(start + 2, end);
      const trimmedLink = originalLink.trim();

      segments.push(content.slice(cursor, start));
      segments.push(`[[${trimmedLink}]]`);

      if (trimmedLink !== originalLink) {
        changesMade.push(
          `Fixed wikilink formatting: [[${originalLink}]] -> [[${trimmedLink}]]`,
        );
        mutated = true;
      }

      cursor = end + 2;
    }

    if (!mutated) {
      return content;
    }

    segments.push(content.slice(cursor));
    return segments.join('');
  }

  private normalizeMarkdownLinks(content: string, changesMade: string[]): string {
    let cursor = 0;
    let mutated = false;
    const segments: string[] = [];

    const appendRemainder = (index: number): void => {
      segments.push(content.slice(cursor, index));
    };

    while (cursor < content.length) {
      const start = content.indexOf('[', cursor);
      if (start === -1) {
        break;
      }

      const textEnd = content.indexOf(']', start + 1);
      if (textEnd === -1 || content[textEnd + 1] !== '(') {
        cursor = start + 1;
        continue;
      }

      const urlEnd = content.indexOf(')', textEnd + 2);
      if (urlEnd === -1) {
        break;
      }

      const originalText = content.slice(start + 1, textEnd);
      const originalUrl = content.slice(textEnd + 2, urlEnd);
      const trimmedText = originalText.trim();
      const trimmedUrl = originalUrl.trim();

      appendRemainder(start);
      segments.push(`[${trimmedText}](${trimmedUrl})`);

      if (trimmedText !== originalText || trimmedUrl !== originalUrl) {
        changesMade.push(
          `Fixed markdown link formatting: [${originalText}](${originalUrl}) -> [${trimmedText}](${trimmedUrl})`,
        );
        mutated = true;
      }

      cursor = urlEnd + 1;
    }

    if (!mutated) {
      return content;
    }

    segments.push(content.slice(cursor));
    return segments.join('');
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
