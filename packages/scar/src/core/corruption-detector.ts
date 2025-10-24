/**
 * File corruption detection system for Scar
 */

import { readFile, stat } from 'fs/promises';
import { extname, basename } from 'path';
import { createHash } from 'crypto';
import { glob } from 'glob';
import {
  FileCorruption,
  CorruptionPattern,
  FileAnalysisResult,
  ScarType,
  ScarSeverity,
} from '../types/index.js';

export class CorruptionDetector {
  private readonly patterns: CorruptionPattern[] = [
    // Double extensions (.md.md)
    {
      type: ScarType.FILENAME_CORRUPTION,
      pattern: /^(.+)\.(md|txt|json|yaml|yml)\.(md|txt|json|yaml|yml)$/,
      description: 'File has double extension (e.g., file.md.md)',
      severity: ScarSeverity.HIGH,
      autoHealable: true,
      healer: 'FilenameHealer',
    },

    // Spaces and numbers in extensions ( 2.md, 3.md)
    {
      type: ScarType.FILENAME_CORRUPTION,
      pattern: /^(.+)\s+\d+\.(md|txt|json|yaml|yml)$/,
      description: 'File has space and number in extension (e.g., file 2.md)',
      severity: ScarSeverity.HIGH,
      autoHealable: true,
      healer: 'FilenameHealer',
    },

    // Command-line arguments in titles
    {
      type: ScarType.FILENAME_CORRUPTION,
      pattern: /^--(title|description)\s+/,
      description: 'Filename starts with command-line arguments',
      severity: ScarSeverity.MEDIUM,
      autoHealable: true,
      healer: 'FilenameHealer',
    },

    // Unusual characters in filenames
    {
      type: ScarType.FILENAME_CORRUPTION,
      pattern: /[{}[\]|\\<>]/,
      description: 'Filename contains unusual characters',
      severity: ScarSeverity.MEDIUM,
      autoHealable: true,
      healer: 'FilenameHealer',
    },

    // Repeated slashes in content
    {
      type: ScarType.CONTENT_CORRUPTION,
      pattern: /\/\/\*/g,
      description: 'Content has repeated slash patterns (//*)',
      severity: ScarSeverity.MEDIUM,
      autoHealable: true,
      healer: 'ContentHealer',
    },

    // Excessive backslashes
    {
      type: ScarType.CONTENT_CORRUPTION,
      pattern: /\\\\{3,}/g,
      description: 'Content has excessive backslashes',
      severity: ScarSeverity.MEDIUM,
      autoHealable: true,
      healer: 'ContentHealer',
    },

    // Malformed markdown headers
    {
      type: ScarType.CONTENT_CORRUPTION,
      pattern: /^#{4,}/gm,
      description: 'Content has excessive markdown header levels',
      severity: ScarSeverity.LOW,
      autoHealable: true,
      healer: 'ContentHealer',
    },

    // Broken frontmatter
    {
      type: ScarType.STRUCTURE_CORRUPTION,
      pattern: /^---\s*\n.*?\n---\s*\n/s,
      description: 'Missing or malformed frontmatter',
      severity: ScarSeverity.HIGH,
      autoHealable: false,
      healer: 'StructureHealer',
    },

    // Encoding issues (non-UTF8 characters)
    {
      type: ScarType.ENCODING_CORRUPTION,
      pattern: /[^\x00-\x7F\u00A0-\uFFFF]/,
      description: 'Content contains potentially corrupted characters',
      severity: ScarSeverity.MEDIUM,
      autoHealable: true,
      healer: 'EncodingHealer',
    },

    // Metadata corruption in YAML frontmatter
    {
      type: ScarType.METADATA_CORRUPTION,
      pattern: /^---\s*\n(.*?\n)*?uuid:\s*["']?["']?\s*\n/m,
      description: 'Missing or empty UUID in frontmatter',
      severity: ScarSeverity.HIGH,
      autoHealable: true,
      healer: 'MetadataHealer',
    },
  ];

  async analyzeFile(filePath: string): Promise<FileAnalysisResult> {
    try {
      const fileStats = await stat(filePath);
      const content = await readFile(filePath, 'utf-8');
      const filename = basename(filePath);

      const corruptions: FileCorruption[] = [];

      // Check filename corruptions
      for (const pattern of this.patterns.filter((p) => p.type === ScarType.FILENAME_CORRUPTION)) {
        if (pattern.pattern.test(filename)) {
          corruptions.push({
            type: pattern.type,
            severity: pattern.severity,
            description: pattern.description,
            filePath,
            detectedAt: new Date(),
            evidence: [filename],
            autoHealable: pattern.autoHealable,
          });
        }
      }

      // Check content corruptions
      for (const pattern of this.patterns.filter((p) => p.type !== ScarType.FILENAME_CORRUPTION)) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          corruptions.push({
            type: pattern.type,
            severity: pattern.severity,
            description: pattern.description,
            filePath,
            detectedAt: new Date(),
            evidence: matches.slice(0, 3), // Limit evidence to first 3 matches
            autoHealable: pattern.autoHealable,
          });
        }
      }

      // Check for missing frontmatter in markdown files
      if (extname(filePath) === '.md' && !content.startsWith('---')) {
        corruptions.push({
          type: ScarType.STRUCTURE_CORRUPTION,
          severity: ScarSeverity.HIGH,
          description: 'Markdown file missing frontmatter',
          filePath,
          detectedAt: new Date(),
          evidence: ['File starts without ---'],
          autoHealable: true,
        });
      }

      return {
        filePath,
        isCorrupted: corruptions.length > 0,
        corruptions,
        fileSize: fileStats.size,
        encoding: 'utf-8',
        lastModified: fileStats.mtime,
        checksum: this.calculateChecksum(content),
      };
    } catch (error) {
      return {
        filePath,
        isCorrupted: true,
        corruptions: [
          {
            type: ScarType.STRUCTURE_CORRUPTION,
            severity: ScarSeverity.CRITICAL,
            description: `Unable to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath,
            detectedAt: new Date(),
            evidence: [],
            autoHealable: false,
          },
        ],
        fileSize: 0,
        encoding: 'unknown',
        lastModified: new Date(),
      };
    }
  }

  async analyzeDirectory(
    directoryPath: string,
    options: {
      includePatterns?: string[];
      excludePatterns?: string[];
      maxConcurrency?: number;
    } = {},
  ): Promise<FileAnalysisResult[]> {
    const {
      includePatterns = ['**/*.md', '**/*.txt', '**/*.json', '**/*.yaml', '**/*.yml'],
      excludePatterns = ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      maxConcurrency = 10,
    } = options;

    const files = await glob(includePatterns, {
      cwd: directoryPath,
      ignore: excludePatterns,
      absolute: true,
    });

    // Process files in batches to avoid overwhelming the system
    const results: FileAnalysisResult[] = [];
    for (let i = 0; i < files.length; i += maxConcurrency) {
      const batch = files.slice(i, i + maxConcurrency);
      const batchResults = await Promise.all(batch.map((file) => this.analyzeFile(file)));
      results.push(...batchResults);
    }

    return results;
  }

  detectCorruptionType(filePath: string, content: string): ScarType | null {
    const filename = basename(filePath);

    for (const pattern of this.patterns) {
      const testTarget = pattern.type === ScarType.FILENAME_CORRUPTION ? filename : content;
      if (pattern.pattern.test(testTarget)) {
        return pattern.type;
      }
    }

    return null;
  }

  getCorruptionPatterns(): ReadonlyArray<CorruptionPattern> {
    return this.patterns;
  }

  addCustomPattern(pattern: CorruptionPattern): void {
    this.patterns.push(pattern);
  }

  removePattern(index: number): void {
    if (index >= 0 && index < this.patterns.length) {
      this.patterns.splice(index, 1);
    }
  }

  private calculateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Detect specific corruption patterns found in the docs/agile/tasks directory
   */
  async detectTaskFileCorruptions(filePath: string): Promise<FileCorruption[]> {
    const corruptions: FileCorruption[] = [];
    const filename = basename(filePath);

    try {
      const content = await readFile(filePath, 'utf-8');

      // Double extension check
      if (/^(.+)\.(md|txt|json|yaml|yml)\.(md|txt|json|yaml|yml)$/.test(filename)) {
        corruptions.push({
          type: ScarType.FILENAME_CORRUPTION,
          severity: ScarSeverity.HIGH,
          description: 'Double extension detected',
          filePath,
          detectedAt: new Date(),
          evidence: [filename],
          autoHealable: true,
        });
      }

      // Space and number in extension
      if (/^(.+)\s+\d+\.(md|txt|json|yaml|yml)$/.test(filename)) {
        corruptions.push({
          type: ScarType.FILENAME_CORRUPTION,
          severity: ScarSeverity.HIGH,
          description: 'Space and number in extension',
          filePath,
          detectedAt: new Date(),
          evidence: [filename],
          autoHealable: true,
        });
      }

      // Command line args in filename
      if (/^--(title|description)/.test(filename)) {
        corruptions.push({
          type: ScarType.FILENAME_CORRUPTION,
          severity: ScarSeverity.MEDIUM,
          description: 'Command-line arguments in filename',
          filePath,
          detectedAt: new Date(),
          evidence: [filename],
          autoHealable: true,
        });
      }

      // Unusual characters
      if (/[{}[\]|\\<>]/.test(filename)) {
        corruptions.push({
          type: ScarType.FILENAME_CORRUPTION,
          severity: ScarSeverity.MEDIUM,
          description: 'Unusual characters in filename',
          filePath,
          detectedAt: new Date(),
          evidence: [filename],
          autoHealable: true,
        });
      }

      // Content issues
      if (/\/\/\*/.test(content)) {
        corruptions.push({
          type: ScarType.CONTENT_CORRUPTION,
          severity: ScarSeverity.MEDIUM,
          description: 'Repeated slash patterns in content',
          filePath,
          detectedAt: new Date(),
          evidence: content.match(/\/\/\*/g)?.slice(0, 3) || [],
          autoHealable: true,
        });
      }

      if (/\\\\{3,}/.test(content)) {
        corruptions.push({
          type: ScarType.CONTENT_CORRUPTION,
          severity: ScarSeverity.MEDIUM,
          description: 'Excessive backslashes in content',
          filePath,
          detectedAt: new Date(),
          evidence: content.match(/\\\\{3,}/g)?.slice(0, 3) || [],
          autoHealable: true,
        });
      }
    } catch (error) {
      corruptions.push({
        type: ScarType.STRUCTURE_CORRUPTION,
        severity: ScarSeverity.CRITICAL,
        description: `Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath,
        detectedAt: new Date(),
        evidence: [],
        autoHealable: false,
      });
    }

    return corruptions;
  }
}
