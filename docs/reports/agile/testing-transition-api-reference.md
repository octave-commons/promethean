# API Reference Documentation

## Comprehensive Testing Transition Rule

**Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Package**: `@promethean/kanban`

---

## Table of Contents

1. [Core Interfaces](#core-interfaces)
2. [Module APIs](#module-apis)
3. [Configuration Options](#configuration-options)
4. [Error Handling](#error-handling)
5. [Usage Examples](#usage-examples)
6. [Type Definitions](#type-definitions)

---

## Core Interfaces

### TestCoverageRequest

Interface for requesting test coverage analysis.

```typescript
interface TestCoverageRequest {
  format: 'lcov' | 'cobertura' | 'json';
  reportPath: string;
}
```

**Properties**:

- `format`: Coverage report format ('lcov', 'cobertura', 'json')
- `reportPath`: Absolute or relative path to the coverage report file

**Example**:

```typescript
const request: TestCoverageRequest = {
  format: 'lcov',
  reportPath: './coverage/lcov.info',
};
```

### TestCoverageResult

Result of coverage analysis containing total and per-file coverage.

```typescript
interface TestCoverageResult {
  totalCoverage: number;
  fileCoverage: Record<string, number>;
}
```

**Properties**:

- `totalCoverage`: Overall coverage percentage (0-100)
- `fileCoverage`: Object mapping file paths to coverage percentages

**Example**:

```typescript
const result: TestCoverageResult = {
  totalCoverage: 92.5,
  fileCoverage: {
    'src/main.ts': 95.0,
    'src/utils.ts': 88.0,
    'src/components/Button.tsx': 100.0,
  },
};
```

### TestQualityScore

Comprehensive quality score with detailed metrics breakdown.

```typescript
interface TestQualityScore {
  score: number;
  details?: {
    complexity: number;
    passRate: number;
    flakiness: number;
  };
}
```

**Properties**:

- `score`: Composite quality score (0-100)
- `details`: Optional detailed breakdown
  - `complexity`: Average cyclomatic complexity
  - `passRate`: Percentage of passing tests (0-100)
  - `flakiness`: Flakiness indicator (0-100, lower is better)

**Example**:

```typescript
const quality: TestQualityScore = {
  score: 87,
  details: {
    complexity: 3.2,
    passRate: 95.5,
    flakiness: 5.0,
  },
};
```

### RequirementMapping

Mapping between requirements and their covering tests.

```typescript
interface RequirementMapping {
  requirementId: string;
  testIds: string[];
  isCovered: boolean;
}
```

**Properties**:

- `requirementId`: Unique identifier for the requirement
- `testIds`: Array of test identifiers covering this requirement
- `isCovered`: Whether the requirement is adequately covered

**Example**:

```typescript
const mapping: RequirementMapping = {
  requirementId: 'REQ-001',
  testIds: ['test-user-login', 'test-user-authentication'],
  isCovered: true,
};
```

### AIAnalysisRequest

Request for AI-powered analysis of test quality and context.

```typescript
interface AIAnalysisRequest {
  tests: string[];
  coverageResult: TestCoverageResult;
  qualityScore: TestQualityScore;
  mappings: RequirementMapping[];
}
```

**Properties**:

- `tests`: List of test identifiers
- `coverageResult`: Coverage analysis results
- `qualityScore`: Quality scoring results
- `mappings`: Requirement-to-test mappings

### AIAnalysisResult

Results from AI analysis including insights and recommendations.

```typescript
interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  overallScore: number;
}
```

**Properties**:

- `insights`: Array of contextual insights
- `recommendations`: Array of actionable recommendations
- `overallScore`: AI-provided aggregate quality score (0-100)

### TestingTransitionConfig

Configuration for the testing transition validation system.

```typescript
interface TestingTransitionConfig {
  hardBlockCoverageThreshold: number;
  softBlockQualityScoreThreshold: number;
  supportedFormats: Array<'lcov' | 'cobertura' | 'json'>;
  performanceTimeoutSeconds: number;
}
```

**Properties**:

- `hardBlockCoverageThreshold`: Coverage percentage that blocks transition (default: 90)
- `softBlockQualityScoreThreshold`: Quality score that triggers soft block (default: 75)
- `supportedFormats`: Array of supported coverage report formats
- `performanceTimeoutSeconds`: Maximum time for validation (default: 30)

---

## Module APIs

### Coverage Analyzer (`coverage-analyzer.ts`)

#### `analyzeCoverage(request: TestCoverageRequest): Promise<TestCoverageResult>`

Analyzes test coverage from a coverage report file.

**Parameters**:

- `request`: Coverage analysis request with format and file path

**Returns**: Promise resolving to coverage analysis results

**Throws**:

- `Error`: When file not found, format unsupported, or parsing fails

**Example**:

```typescript
import { analyzeCoverage } from './coverage-analyzer.js';

const request: TestCoverageRequest = {
  format: 'lcov',
  reportPath: './coverage/lcov.info',
};

try {
  const result = await analyzeCoverage(request);
  console.log(`Total coverage: ${result.totalCoverage}%`);
} catch (error) {
  console.error('Coverage analysis failed:', error.message);
}
```

### Quality Scorer (`quality-scorer.ts`)

#### `calculateQualityScore(details: QualityDetails): TestQualityScore`

Calculates comprehensive quality score from test metrics.

**Parameters**:

- `details`: Object containing complexity, pass rate, and flakiness metrics

**Returns**: Quality score with detailed breakdown

**Example**:

```typescript
import { calculateQualityScore } from './quality-scorer.js';

const score = calculateQualityScore({
  complexity: 2.5,
  passRate: 98.0,
  flakiness: 3.0,
});

console.log(`Quality score: ${score.score}/100`);
```

### Requirement Mapper (`requirement-mapper.ts`)

#### `mapRequirements(mappings: RequirementMapping[], executedTests: string[]): RequirementMapping[]`

Validates and processes requirement-to-test mappings.

**Parameters**:

- `mappings`: Array of requirement mappings
- `executedTests`: List of actually executed test identifiers

**Returns**: Validated and updated requirement mappings

#### `validateMappings(mappings: RequirementMapping[]): boolean`

Validates that all requirements are properly covered.

**Parameters**:

- `mappings`: Array of requirement mappings to validate

**Returns**: True if all requirements are covered, false otherwise

**Example**:

```typescript
import { mapRequirements, validateMappings } from './requirement-mapper.js';

const mappings = mapRequirements(initialMappings, executedTests);
const isValid = validateMappings(mappings);

if (!isValid) {
  console.log('Some requirements are not covered by tests');
}
```

### AI Analyzer (`ai-analyzer.ts`)

#### `analyzeWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResult>`

Performs AI-powered analysis of test quality and context.

**Parameters**:

- `request`: AI analysis request with all test metrics

**Returns**: Promise resolving to AI analysis results

**Note**: Currently contains placeholder implementation

**Example**:

```typescript
import { analyzeWithAI } from './ai-analyzer.js';

const aiRequest: AIAnalysisRequest = {
  tests: ['test-login', 'test-logout'],
  coverageResult: coverageResult,
  qualityScore: qualityScore,
  mappings: mappings,
};

const aiResult = await analyzeWithAI(aiRequest);
console.log('AI insights:', aiResult.insights);
```

### Report Generator (`report-generator.ts`)

#### `generateReport(data: ReportData, outputDir: string): string`

Generates comprehensive markdown report and updates task frontmatter.

**Parameters**:

- `data`: Complete analysis data including coverage, quality, mappings, and AI results
- `outputDir`: Directory where report should be saved

**Returns**: Path to generated report file

**Example**:

```typescript
import { generateReport } from './report-generator.js';

const reportPath = generateReport(
  {
    coverage: coverageResult,
    qualityScore: qualityScore,
    mappings: mappings,
    aiAnalysis: aiResult,
  },
  './reports',
);

console.log(`Report generated: ${reportPath}`);
```

### Main Orchestrator (`index.ts`)

#### `runTestingTransition(request, executedTests, initialMappings, config, tests, outputDir): Promise<string>`

Main orchestrator that runs the complete testing transition validation.

**Parameters**:

- `request`: TestCoverageRequest for coverage analysis
- `executedTests`: Array of executed test identifiers
- `initialMappings`: Initial requirement-to-test mappings
- `config`: TestingTransitionConfig with thresholds and settings
- `tests`: Array of all test files
- `outputDir`: Directory for output reports

**Returns**: Promise resolving to report file path

**Throws**:

- `Error`: When validation fails (coverage below threshold, quality too low, etc.)

**Example**:

```typescript
import { runTestingTransition } from './index.js';

const config: TestingTransitionConfig = {
  hardBlockCoverageThreshold: 90,
  softBlockQualityScoreThreshold: 75,
  supportedFormats: ['lcov', 'cobertura', 'json'],
  performanceTimeoutSeconds: 30,
};

try {
  const reportPath = await runTestingTransition(
    coverageRequest,
    executedTests,
    requirementMappings,
    config,
    allTests,
    './output',
  );
  console.log(`Validation complete: ${reportPath}`);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

---

## Configuration Options

### Default Configuration

```typescript
const defaultConfig: TestingTransitionConfig = {
  hardBlockCoverageThreshold: 90, // 90% coverage required
  softBlockQualityScoreThreshold: 75, // 75% quality score threshold
  supportedFormats: ['lcov', 'cobertura', 'json'],
  performanceTimeoutSeconds: 30, // 30-second timeout
};
```

### Configuration Sources

1. **Kanban Configuration File** (`promethean.kanban.json`)

```json
{
  "transitionRules": {
    "customChecks": {
      "comprehensive-testing-validation?": {
        "description": "Comprehensive testing validation",
        "impl": "(comprehensive-testing-validation? task board)"
      }
    }
  }
}
```

2. **Environment Variables**

```bash
TESTING_TRANSITION_COVERAGE_THRESHOLD=90
TESTING_TRANSITION_QUALITY_THRESHOLD=75
TESTING_TRANSITION_TIMEOUT=30
TESTING_TRANSITION_AI_ENABLED=true
```

3. **Runtime Configuration**

```typescript
const customConfig: TestingTransitionConfig = {
  ...defaultConfig,
  hardBlockCoverageThreshold: 85, // Lower threshold for development
  performanceTimeoutSeconds: 60, // Longer timeout for large projects
};
```

### Threshold Configuration

| Threshold           | Default | Range  | Description                          |
| ------------------- | ------- | ------ | ------------------------------------ |
| Coverage Hard Block | 90%     | 0-100% | Minimum coverage to allow transition |
| Quality Soft Block  | 75%     | 0-100% | Quality score that triggers warning  |
| Performance Timeout | 30s     | 5-300s | Maximum validation time              |

### Format Support Configuration

```typescript
const formatConfig = {
  lcov: {
    enabled: true,
    parser: 'parseLcov',
    extensions: ['.lcov', '.info'],
  },
  cobertura: {
    enabled: true,
    parser: 'parseCobertura',
    extensions: ['.xml'],
  },
  json: {
    enabled: true,
    parser: 'parseJsonCoverage',
    extensions: ['.json'],
  },
};
```

---

## Error Handling

### Error Types

#### `CoverageAnalysisError`

Thrown when coverage report analysis fails.

```typescript
class CoverageAnalysisError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
  ) {
    super(`Coverage analysis failed for ${filePath}: ${message}`);
    this.name = 'CoverageAnalysisError';
  }
}
```

**Common Causes**:

- Coverage report file not found
- Unsupported file format
- Malformed coverage data
- File permission issues

#### `QualityScoringError`

Thrown when quality scoring calculation fails.

```typescript
class QualityScoringError extends Error {
  constructor(
    message: string,
    public readonly metrics: any,
  ) {
    super(`Quality scoring failed: ${message}`);
    this.name = 'QualityScoringError';
  }
}
```

**Common Causes**:

- Invalid metric values
- Missing test execution data
- Calculation overflow/underflow

#### `RequirementMappingError`

Thrown when requirement mapping validation fails.

```typescript
class RequirementMappingError extends Error {
  constructor(
    message: string,
    public readonly requirementId: string,
  ) {
    super(`Requirement mapping failed for ${requirementId}: ${message}`);
    this.name = 'RequirementMappingError';
  }
}
```

**Common Causes**:

- Uncovered requirements
- Invalid requirement IDs
- Missing test mappings

#### `PerformanceTimeoutError`

Thrown when validation exceeds timeout limit.

```typescript
class PerformanceTimeoutError extends Error {
  constructor(timeoutSeconds: number) {
    super(`Validation timeout after ${timeoutSeconds} seconds`);
    this.name = 'PerformanceTimeoutError';
  }
}
```

#### `ValidationError`

Thrown when validation fails due to quality gates.

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly type: 'coverage' | 'quality' | 'mapping',
    public readonly actualValue: number,
    public readonly threshold: number,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Handling Patterns

#### Try-Catch Pattern

```typescript
try {
  const result = await runTestingTransition(request, tests, mappings, config, allTests, outputDir);
  console.log(`Success: ${result}`);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Validation failed: ${error.type} - ${error.actualValue} < ${error.threshold}`);
  } else if (error instanceof PerformanceTimeoutError) {
    console.log('Validation timed out, please try again');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

#### Graceful Degradation

```typescript
async function runValidationWithFallback(request: TestCoverageRequest) {
  try {
    return await analyzeCoverage(request);
  } catch (error) {
    // Fallback to default low coverage
    console.warn(`Coverage analysis failed, using fallback: ${error.message}`);
    return {
      totalCoverage: 0,
      fileCoverage: {},
    };
  }
}
```

#### Retry Pattern

```typescript
async function runWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Usage Examples

### Basic Usage

```typescript
import { runTestingTransition } from '@promethean/kanban/testing-transition';

// Basic configuration
const config = {
  hardBlockCoverageThreshold: 90,
  softBlockQualityScoreThreshold: 75,
  supportedFormats: ['lcov', 'cobertura', 'json'],
  performanceTimeoutSeconds: 30,
};

// Run validation
try {
  const reportPath = await runTestingTransition(
    { format: 'lcov', reportPath: './coverage/lcov.info' },
    ['test-login', 'test-logout', 'test-user-profile'],
    [
      { requirementId: 'REQ-001', testIds: ['test-login'] },
      { requirementId: 'REQ-002', testIds: ['test-logout'] },
    ],
    config,
    ['test-login.test.ts', 'test-logout.test.ts', 'test-user-profile.test.ts'],
    './reports',
  );

  console.log(`✅ Validation passed: ${reportPath}`);
} catch (error) {
  console.error(`❌ Validation failed: ${error.message}`);
}
```

### Advanced Usage with Custom Configuration

```typescript
import {
  runTestingTransition,
  TestingTransitionConfig,
} from '@promethean/kanban/testing-transition';

// Custom configuration for development environment
const devConfig: TestingTransitionConfig = {
  hardBlockCoverageThreshold: 85, // Lower threshold for development
  softBlockQualityScoreThreshold: 70, // Lower quality threshold
  supportedFormats: ['lcov', 'json'], // Exclude cobertura in dev
  performanceTimeoutSeconds: 60, // Longer timeout for debugging
};

// Run with custom configuration
const result = await runTestingTransition(
  coverageRequest,
  executedTests,
  requirementMappings,
  devConfig,
  allTests,
  './dev-reports',
);
```

### Integration with Kanban CLI

```typescript
// Example integration in kanban CLI
import { validateTestingToReviewTransition } from '@promethean/kanban/transition-rules';

// Called when moving task from testing to review
async function handleTestingToReviewTransition(taskId: string) {
  const task = await getTask(taskId);
  const board = await getCurrentBoard();

  try {
    const result = await validateTestingToReviewTransition(task, board);

    if (result.allowed) {
      await moveTaskToReview(taskId);
      console.log(`✅ Task ${taskId} moved to review`);
    } else {
      console.log(`❌ Transition blocked: ${result.reason}`);
      console.log(`Suggestions: ${result.suggestions.join(', ')}`);
    }
  } catch (error) {
    console.error(`Transition validation failed: ${error.message}`);
  }
}
```

### Batch Processing

```typescript
// Process multiple testing tasks
async function processTestingQueue(taskIds: string[]) {
  const results = await Promise.allSettled(
    taskIds.map(async (taskId) => {
      const task = await getTask(taskId);
      const board = await getCurrentBoard();
      return await validateTestingToReviewTransition(task, board);
    }),
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Task ${taskIds[index]}: ${result.value.allowed ? '✅' : '❌'}`);
    } else {
      console.error(`Task ${taskIds[index]}: Error - ${result.reason}`);
    }
  });
}
```

### Custom Coverage Analysis

```typescript
import { analyzeCoverage } from '@promethean/kanban/testing-transition/coverage-analyzer';

// Analyze different coverage formats
async function analyzeMultipleFormats() {
  const formats = [
    { format: 'lcov' as const, path: './coverage/lcov.info' },
    { format: 'cobertura' as const, path: './coverage/coverage.xml' },
    { format: 'json' as const, path: './coverage/coverage.json' },
  ];

  for (const { format, path } of formats) {
    try {
      const result = await analyzeCoverage({ format, reportPath: path });
      console.log(`${format.toUpperCase()} coverage: ${result.totalCoverage}%`);
    } catch (error) {
      console.error(`${format} analysis failed: ${error.message}`);
    }
  }
}
```

### Custom Quality Scoring

```typescript
import { calculateQualityScore } from '@promethean/kanban/testing-transition/quality-scorer';

// Calculate quality score with custom metrics
function analyzeTestQuality(testResults: TestResult[]) {
  const metrics = {
    complexity: calculateAverageComplexity(testResults),
    passRate: calculatePassRate(testResults),
    flakiness: calculateFlakiness(testResults),
  };

  const qualityScore = calculateQualityScore(metrics);

  console.log(`Quality Score: ${qualityScore.score}/100`);
  console.log(`Details:`, qualityScore.details);

  return qualityScore;
}

function calculateAverageComplexity(testResults: TestResult[]): number {
  return testResults.reduce((sum, test) => sum + test.complexity, 0) / testResults.length;
}

function calculatePassRate(testResults: TestResult[]): number {
  const passed = testResults.filter((test) => test.status === 'passed').length;
  return (passed / testResults.length) * 100;
}

function calculateFlakiness(testResults: TestResult[]): number {
  // Calculate flakiness based on historical failure rate
  return testResults.reduce((sum, test) => sum + test.flakinessScore, 0) / testResults.length;
}
```

---

## Type Definitions

### Complete Type Schema

```typescript
// Core request/response types
export interface TestCoverageRequest {
  format: 'lcov' | 'cobertura' | 'json';
  reportPath: string;
}

export interface TestCoverageResult {
  totalCoverage: number;
  fileCoverage: Record<string, number>;
}

export interface TestQualityScore {
  score: number;
  details?: {
    complexity: number;
    passRate: number;
    flakiness: number;
  };
}

export interface RequirementMapping {
  requirementId: string;
  testIds: string[];
  isCovered: boolean;
}

export interface AIAnalysisRequest {
  tests: string[];
  coverageResult: TestCoverageResult;
  qualityScore: TestQualityScore;
  mappings: RequirementMapping[];
}

export interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  overallScore: number;
}

// Configuration types
export interface TestingTransitionConfig {
  hardBlockCoverageThreshold: number;
  softBlockQualityScoreThreshold: number;
  supportedFormats: Array<'lcov' | 'cobertura' | 'json'>;
  performanceTimeoutSeconds: number;
}

// Internal types
export interface QualityDetails {
  complexity: number;
  passRate: number;
  flakiness: number;
}

export interface ReportData {
  coverage: TestCoverageResult;
  qualityScore: TestQualityScore;
  mappings: RequirementMapping[];
  aiAnalysis: AIAnalysisResult;
}

export interface TransitionResult {
  allowed: boolean;
  reason: string;
  ruleViolations: string[];
  suggestions: string[];
  suggestedAlternatives: string[];
  warnings: string[];
}

// Error types
export class CoverageAnalysisError extends Error {
  constructor(message: string, public readonly filePath: string);
}

export class QualityScoringError extends Error {
  constructor(message: string, public readonly metrics: any);
}

export class RequirementMappingError extends Error {
  constructor(message: string, public readonly requirementId: string);
}

export class PerformanceTimeoutError extends Error {
  constructor(timeoutSeconds: number);
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly type: 'coverage' | 'quality' | 'mapping',
    public readonly actualValue: number,
    public readonly threshold: number
  );
}
```

### Utility Types

```typescript
// Format-specific parser types
export type CoverageFormat = 'lcov' | 'cobertura' | 'json';

export type CoverageParser = (raw: string) => TestCoverageResult;

export interface CoverageFormatConfig {
  enabled: boolean;
  parser: string;
  extensions: string[];
}

// Validation result types
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: Error;
    };

export type AsyncValidationResult<T> = Promise<ValidationResult<T>>;

// Configuration union types
export type ThresholdType = 'coverage' | 'quality';
export type BlockType = 'hard' | 'soft';

export interface ThresholdConfig {
  type: ThresholdType;
  blockType: BlockType;
  value: number;
  description: string;
}
```

---

## API Versioning

### Version 1.0.0

Current stable version with all core features:

- Coverage analysis (LCOV, Cobertura, JSON)
- Quality scoring (0-100 scale)
- Requirement mapping validation
- AI analysis framework
- Report generation
- Performance protection

### Future Versions

#### v1.1.0 (Planned)

- Enhanced AI integration
- Additional coverage metrics (branch, function)
- Performance optimizations
- Extended reporting features

#### v1.2.0 (Planned)

- Real-time validation
- Distributed processing
- Advanced analytics
- Custom rule engine

---

## Support and Maintenance

### Getting Help

- **Documentation**: This API reference and technical specification
- **Issues**: Create GitHub issues in the Promethean repository
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Community**: Join the Promethean Discord server

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

### License

This API is part of the Promethean Framework and is licensed under the MIT License.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**API Version**: 1.0.0  
**Maintainer**: Promethean Development Team
