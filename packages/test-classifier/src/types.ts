/**
 * Test type enumeration for classification
 */
export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  UNKNOWN = 'unknown',
}

/**
 * Classification result for a test file
 */
export interface ClassificationResult {
  /** The file path that was classified */
  filePath: string;
  /** The determined test type */
  testType: TestType;
  /** Confidence score from 0 to 1 */
  confidence: number;
  /** Reasoning for the classification */
  reasoning: string[];
  /** Whether this was based on filename pattern or content analysis */
  classificationMethod: 'filename' | 'content' | 'directory';
}

/**
 * Configuration for test classification rules
 */
export interface ClassificationConfig {
  /** Filename patterns for each test type */
  filenamePatterns: Record<TestType, string[]>;
  /** Directory patterns for each test type */
  directoryPatterns: Record<TestType, string[]>;
  /** Content patterns to look for in test files */
  contentPatterns: Record<TestType, string[]>;
  /** Minimum confidence threshold for classification */
  minConfidence: number;
}

/**
 * Summary of classification results for a batch of files
 */
export interface ClassificationSummary {
  /** Total files processed */
  totalFiles: number;
  /** Files classified by type */
  byType: Record<TestType, number>;
  /** Files that couldn't be classified */
  unclassified: number;
  /** Average confidence score */
  averageConfidence: number;
  /** Classification results */
  results: ClassificationResult[];
}
