import { readFileSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { TestType, ClassificationResult, ClassificationConfig } from './types.js';
import { DEFAULT_CONFIG } from './config.js';

/**
 * Test classifier for categorizing test files by type
 */
export class TestClassifier {
  private config: ClassificationConfig;

  constructor(config: Partial<ClassificationConfig> = {}) {
    this.config = {
      filenamePatterns: { ...DEFAULT_CONFIG.filenamePatterns, ...config.filenamePatterns },
      directoryPatterns: { ...DEFAULT_CONFIG.directoryPatterns, ...config.directoryPatterns },
      contentPatterns: { ...DEFAULT_CONFIG.contentPatterns, ...config.contentPatterns },
      minConfidence: config.minConfidence ?? DEFAULT_CONFIG.minConfidence,
    };
  }

  /**
   * Classify a single test file
   */
  classifyFile(filePath: string, workspaceRoot = process.cwd()): ClassificationResult {
    const relativePath = relative(workspaceRoot, resolve(filePath));
    const filename = basename(relativePath);

    // Try filename-based classification first (highest confidence)
    const filenameResult = this.classifyByFilename(filename);
    if (filenameResult.confidence >= this.config.minConfidence) {
      return {
        filePath: relativePath,
        ...filenameResult,
        classificationMethod: 'filename',
      };
    }

    // Try directory-based classification
    const directoryResult = this.classifyByDirectory(relativePath);
    if (directoryResult.confidence >= this.config.minConfidence) {
      return {
        filePath: relativePath,
        ...directoryResult,
        classificationMethod: 'directory',
      };
    }

    // Fall back to content analysis
    try {
      const content = readFileSync(resolve(workspaceRoot, relativePath), 'utf8');
      const contentResult = this.classifyByContent(content);
      return {
        filePath: relativePath,
        ...contentResult,
        classificationMethod: 'content',
      };
    } catch (error) {
      // If we can't read the file, return unknown with low confidence
      return {
        filePath: relativePath,
        testType: TestType.UNKNOWN,
        confidence: 0.1,
        reasoning: ['Could not read file content'],
        classificationMethod: 'content',
      };
    }
  }

  /**
   * Classify multiple test files
   */
  classifyFiles(filePaths: string[], workspaceRoot = process.cwd()): ClassificationResult[] {
    return filePaths.map((filePath) => this.classifyFile(filePath, workspaceRoot));
  }

  /**
   * Simple pattern matching function
   */
  private matchesPattern(text: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(text);
  }

  /**
   * Classify a test file based on its filename
   */
  private classifyByFilename(filename: string): {
    testType: TestType;
    confidence: number;
    reasoning: string[];
  } {
    const results: Array<{ testType: TestType; confidence: number; reasoning: string[] }> = [];

    for (const [testType, patterns] of Object.entries(this.config.filenamePatterns)) {
      for (const pattern of patterns) {
        if (this.matchesPattern(filename, pattern)) {
          let confidence = 0.8;
          const reasoning: string[] = [`Filename matches pattern: ${pattern}`];

          // Higher confidence for explicit patterns
          if (
            pattern.includes('unit') ||
            pattern.includes('integration') ||
            pattern.includes('e2e')
          ) {
            confidence = 0.95;
          }
          // Lower confidence for generic patterns
          else if (
            pattern === '*.test.ts' ||
            pattern === '*.test.js' ||
            pattern === '*.spec.ts' ||
            pattern === '*.spec.js'
          ) {
            confidence = 0.6;
            reasoning.push('Generic test pattern, defaulting to unit');
          }

          results.push({
            testType: testType as TestType,
            confidence,
            reasoning,
          });
        }
      }
    }

    // Return the highest confidence result
    if (results.length > 0) {
      return results.reduce((best, current) =>
        current.confidence > best.confidence ? current : best,
      );
    }

    return {
      testType: TestType.UNKNOWN,
      confidence: 0.1,
      reasoning: ['No filename pattern matched'],
    };
  }

  /**
   * Classify a test file based on its directory structure
   */
  private classifyByDirectory(filePath: string): {
    testType: TestType;
    confidence: number;
    reasoning: string[];
  } {
    const results: Array<{ testType: TestType; confidence: number; reasoning: string[] }> = [];

    for (const [testType, patterns] of Object.entries(this.config.directoryPatterns)) {
      for (const pattern of patterns) {
        if (this.matchesPattern(filePath, pattern)) {
          results.push({
            testType: testType as TestType,
            confidence: 0.85,
            reasoning: [`Directory matches pattern: ${pattern}`],
          });
        }
      }
    }

    // Return the highest confidence result
    if (results.length > 0) {
      return results.reduce((best, current) =>
        current.confidence > best.confidence ? current : best,
      );
    }

    return {
      testType: TestType.UNKNOWN,
      confidence: 0.1,
      reasoning: ['No directory pattern matched'],
    };
  }

  /**
   * Classify a test file based on its content
   */
  private classifyByContent(content: string): {
    testType: TestType;
    confidence: number;
    reasoning: string[];
  } {
    const scores: Record<TestType, { score: number; matches: string[] }> = {
      [TestType.UNIT]: { score: 0, matches: [] },
      [TestType.INTEGRATION]: { score: 0, matches: [] },
      [TestType.E2E]: { score: 0, matches: [] },
      [TestType.UNKNOWN]: { score: 0, matches: [] },
    };

    const contentLower = content.toLowerCase();

    // Score each test type based on content patterns
    for (const [testType, patterns] of Object.entries(this.config.contentPatterns)) {
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          scores[testType as TestType].score += matches.length;
          scores[testType as TestType].matches.push(...matches.slice(0, 3)); // Limit matches to avoid noise
        }
      }
    }

    // Find the test type with the highest score
    let bestType = TestType.UNKNOWN;
    let bestScore = 0;

    for (const [testType, result] of Object.entries(scores)) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestType = testType as TestType;
      }
    }

    // Calculate confidence based on score
    let confidence = 0.1;
    const reasoning: string[] = [];

    if (bestScore > 0) {
      // Base confidence on the number of matches
      confidence = Math.min(0.7, 0.3 + bestScore * 0.1);
      reasoning.push(`Content analysis found ${bestScore} matching patterns`);

      if (scores[bestType].matches.length > 0) {
        reasoning.push(`Key indicators: ${scores[bestType].matches.slice(0, 3).join(', ')}`);
      }

      // Boost confidence for strong indicators
      if (bestType === TestType.E2E && contentLower.includes('playwright')) {
        confidence = Math.max(confidence, 0.8);
        reasoning.push('Strong E2E indicator: playwright detected');
      }
      if (bestType === TestType.INTEGRATION && contentLower.includes('integration')) {
        confidence = Math.max(confidence, 0.75);
        reasoning.push('Strong integration indicator: integration keyword detected');
      }
    } else {
      reasoning.push('No content patterns matched');
    }

    return {
      testType: bestType,
      confidence,
      reasoning,
    };
  }

  /**
   * Get the current configuration
   */
  getConfig(): ClassificationConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<ClassificationConfig>): void {
    this.config = {
      filenamePatterns: { ...this.config.filenamePatterns, ...newConfig.filenamePatterns },
      directoryPatterns: { ...this.config.directoryPatterns, ...newConfig.directoryPatterns },
      contentPatterns: { ...this.config.contentPatterns, ...newConfig.contentPatterns },
      minConfidence: newConfig.minConfidence ?? this.config.minConfidence,
    };
  }
}
