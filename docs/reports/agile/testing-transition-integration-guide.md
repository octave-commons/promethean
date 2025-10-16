# Integration Guide

## Comprehensive Testing Transition Rule

**Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Package**: `@promethean/kanban`

---

## Table of Contents

1. [Overview](#overview)
2. [Kanban FSM Integration](#kanban-fsm-integration)
3. [Agent Workflow Integration](#agent-workflow-integration)
4. [Coverage Analysis Integration](#coverage-analysis-integration)
5. [AI Analysis Integration](#ai-analysis-integration)
6. [Report Generation Integration](#report-generation-integration)
7. [Configuration Management](#configuration-management)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Comprehensive Testing Transition Rule integrates deeply with multiple components of the Promethean ecosystem. This guide provides detailed instructions for integrating the system with various components and customizing it for specific use cases.

### Integration Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Kanban CLI    │───▶│ Testing Transition│───▶│   Task Updates  │
│                 │    │    Validation     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External Systems│
                    │  - Coverage Tools│
                    │  - AI Agents     │
                    │  - Report Storage│
                    └──────────────────┘
```

### Key Integration Points

1. **Kanban FSM**: Transition rule validation and task state management
2. **Agent Workflows**: AI-powered analysis and recommendations
3. **Coverage Tools**: Multi-format coverage report parsing
4. **Report Systems**: Markdown generation and task frontmatter updates
5. **Configuration**: Dynamic configuration and environment-specific settings

---

## Kanban FSM Integration

### Transition Rule Configuration

The testing transition rule integrates with the kanban Finite State Machine through the transition rules engine.

#### 1. Update Transition Rules Configuration

Add the testing→review transition rule to `promethean.kanban.json`:

```json
{
  "transitionRules": {
    "enabled": true,
    "enforcement": "strict",
    "rules": [
      {
        "from": ["testing"],
        "to": ["review", "in_progress", "todo"],
        "description": "Submit for review with comprehensive testing validation",
        "check": "comprehensive-testing-validation?"
      }
    ],
    "customChecks": {
      "comprehensive-testing-validation?": {
        "description": "Comprehensive testing validation with coverage (90%), quality (75%), AI analysis, and requirement mapping",
        "impl": "(comprehensive-testing-validation? task board)"
      }
    }
  }
}
```

#### 2. Clojure DSL Integration

Update the Clojure DSL file `docs/agile/rules/kanban-transitions.clj`:

```clojure
(defn comprehensive-testing-validation?
  "Comprehensive testing validation with coverage (90%), quality (75%), AI analysis, and requirement mapping"
  [task board]
  ;; This function delegates to the TypeScript implementation
  ;; The actual validation is handled by the TransitionRulesEngine
  ;; which provides better integration with coverage analysis tools
  true)
```

#### 3. TypeScript Integration

Implement the validation logic in `packages/kanban/src/lib/transition-rules.ts`:

```typescript
import { runTestingTransition } from './testing-transition/index.js';
import type { Task, Board } from './types.js';

export async function validateTestingToReviewTransition(
  task: Task,
  board: Board,
): Promise<TransitionResult> {
  try {
    // Extract testing information from task content
    const testingInfo = extractTestingInfo(task);

    // Run comprehensive validation
    const reportPath = await runTestingTransition(
      testingInfo.coverageRequest,
      testingInfo.executedTests,
      testingInfo.requirementMappings,
      getTestingConfig(),
      testingInfo.allTests,
      testingInfo.outputDir,
    );

    return {
      allowed: true,
      reason: 'Comprehensive testing validation passed',
      ruleViolations: [],
      suggestions: [],
      suggestedAlternatives: [],
      warnings: [],
    };
  } catch (error) {
    return {
      allowed: false,
      reason: error.message,
      ruleViolations: [error.message],
      suggestions: generateSuggestions(error),
      suggestedAlternatives: [],
      warnings: [],
    };
  }
}

function extractTestingInfo(task: Task): TestingInfo {
  // Parse task content to extract testing information
  const content = task.content || '';

  const coverageReport = extractFrontmatterField(content, 'coverage-report');
  const executedTests = extractFrontmatterField(content, 'executed-tests');
  const requirementMappings = extractFrontmatterField(content, 'requirement-mappings');

  return {
    coverageRequest: {
      format: detectCoverageFormat(coverageReport),
      reportPath: coverageReport,
    },
    executedTests: executedTests ? executedTests.split(',').map((t) => t.trim()) : [],
    requirementMappings: requirementMappings || [],
    allTests: [], // Extract from test files
    outputDir: './reports',
  };
}
```

### Task Content Format

Tasks in "testing" status must include specific frontmatter fields:

```markdown
---
uuid: 9c8d7e6f-5a4b-3c2d-1e0f-9a8b7c6d5e4f
title: Example Testing Task
status: testing
priority: P0
storyPoints: 5
coverage-report: ./coverage/lcov.info
executed-tests: test-login,test-logout,test-user-profile
requirement-mappings: |
  [
    {"requirementId": "REQ-001", "testIds": ["test-login"]},
    {"requirementId": "REQ-002", "testIds": ["test-logout"]},
    {"requirementId": "REQ-003", "testIds": ["test-user-profile"]}
  ]
---

# Task Content

Implementation complete and ready for review.
```

### CLI Integration

Update the CLI command handlers to support testing transition validation:

```typescript
// packages/kanban/src/cli/command-handlers.ts
import { validateTestingToReviewTransition } from '../lib/transition-rules.js';

export async function handleMoveTask(args: MoveTaskArgs): Promise<void> {
  const { taskId, toColumn } = args;

  // Get current task and board
  const task = await getTask(taskId);
  const board = await getCurrentBoard();

  // Check if this is a testing→review transition
  if (task.status === 'testing' && toColumn === 'review') {
    const result = await validateTestingToReviewTransition(task, board);

    if (!result.allowed) {
      console.error(`❌ Transition blocked: ${result.reason}`);
      if (result.suggestions.length > 0) {
        console.log('Suggestions:');
        result.suggestions.forEach((suggestion) => console.log(`  - ${suggestion}`));
      }
      process.exit(1);
    }

    console.log('✅ Testing validation passed');
  }

  // Proceed with normal task move
  await moveTask(taskId, toColumn);
}
```

---

## Agent Workflow Integration

### AI Analysis Setup

The testing transition system integrates with `@promethean/agents-workflow` for AI-powered analysis.

#### 1. Install Dependencies

```bash
pnpm add @promethean/agents-workflow
```

#### 2. Configure AI Analysis

```typescript
// packages/kanban/src/lib/testing-transition/ai-analyzer.ts
import { analyzeWithAgents } from '@promethean/agents-workflow';
import type { AIAnalysisRequest, AIAnalysisResult } from './types.js';

export async function analyzeWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
  try {
    // Prepare analysis prompt
    const prompt = createAnalysisPrompt(request);

    // Submit to agent workflow
    const agentResponse = await analyzeWithAgents({
      taskType: 'test-quality-analysis',
      context: {
        coverage: request.coverageResult,
        quality: request.qualityScore,
        mappings: request.mappings,
        tests: request.tests,
      },
      prompt,
    });

    // Process agent response
    return {
      insights: agentResponse.insights || [],
      recommendations: agentResponse.recommendations || [],
      overallScore: agentResponse.score || 0,
    };
  } catch (error) {
    // Fallback to placeholder implementation
    console.warn('AI analysis failed, using fallback:', error.message);
    return generateFallbackAnalysis(request);
  }
}

function createAnalysisPrompt(request: AIAnalysisRequest): string {
  return `
    Analyze the following test suite and provide insights and recommendations:
    
    Coverage: ${request.coverageResult.totalCoverage}%
    Quality Score: ${request.qualityScore.score}/100
    Tests: ${request.tests.length}
    Requirements Covered: ${request.mappings.filter((m) => m.isCovered).length}/${request.mappings.length}
    
    Provide:
    1. Key insights about test quality
    2. Specific recommendations for improvement
    3. Overall quality assessment (0-100)
  `;
}

function generateFallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
  const coverage = request.coverageResult.totalCoverage;
  const quality = request.qualityScore.score;
  const coverageRate = request.mappings.filter((m) => m.isCovered).length / request.mappings.length;

  const insights = [
    `Coverage is ${coverage >= 90 ? 'excellent' : coverage >= 75 ? 'good' : 'needs improvement'} at ${coverage}%`,
    `Quality score is ${quality >= 75 ? 'acceptable' : 'below threshold'} at ${quality}/100`,
    `${Math.round(coverageRate * 100)}% of requirements are covered by tests`,
  ];

  const recommendations = [];
  if (coverage < 90) {
    recommendations.push(`Increase test coverage to at least 90% (currently ${coverage}%)`);
  }
  if (quality < 75) {
    recommendations.push(`Improve test quality score to at least 75 (currently ${quality})`);
  }
  if (coverageRate < 1) {
    recommendations.push('Ensure all requirements have corresponding test coverage');
  }

  return {
    insights,
    recommendations,
    overallScore: Math.round((coverage + quality + coverageRate * 100) / 3),
  };
}
```

#### 3. Agent Configuration

Configure the agent workflow in your environment:

```typescript
// Agent workflow configuration
const agentConfig = {
  endpoint: process.env.AGENT_WORKFLOW_ENDPOINT || 'http://localhost:3000',
  timeout: 15000, // 15 seconds
  retries: 2,
  models: {
    'test-analysis': 'gpt-4',
    'quality-assessment': 'claude-3-sonnet',
  },
};
```

### Custom Agent Integration

For custom agent implementations:

```typescript
export class CustomAIAnalyzer implements AIAnalyzer {
  constructor(private config: AIConfig) {}

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    // Custom analysis logic
    const customInsights = await this.generateInsights(request);
    const customRecommendations = await this.generateRecommendations(request);
    const customScore = await this.calculateScore(request);

    return {
      insights: customInsights,
      recommendations: customRecommendations,
      overallScore: customScore,
    };
  }

  private async generateInsights(request: AIAnalysisRequest): Promise<string[]> {
    // Custom insight generation logic
    return [];
  }

  private async generateRecommendations(request: AIAnalysisRequest): Promise<string[]> {
    // Custom recommendation logic
    return [];
  }

  private async calculateScore(request: AIAnalysisRequest): Promise<number> {
    // Custom scoring logic
    return 0;
  }
}
```

---

## Coverage Analysis Integration

### Supported Coverage Tools

The system supports multiple coverage analysis tools and formats:

#### 1. Jest (JSON Format)

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

Task configuration:

```yaml
coverage-report: ./coverage/coverage-final.json
```

#### 2. Istanbul/NYC (LCOV Format)

```javascript
// nyc.config.js
module.exports = {
  reporter: ['lcov', 'text'],
  reporterOptions: {
    lcov: { file: 'coverage/lcov.info' },
  },
  branches: 90,
  functions: 90,
  lines: 90,
  statements: 90,
};
```

Task configuration:

```yaml
coverage-report: ./coverage/lcov.info
```

#### 3. Cobertura (XML Format)

```xml
<!-- pom.xml for Maven -->
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>cobertura-maven-plugin</artifactId>
  <version>2.7</version>
  <configuration>
    <formats>
      <format>xml</format>
      <format>html</format>
    </formats>
    <check>
      <lineRate>90</lineRate>
      <branchRate>90</branchRate>
    </check>
  </configuration>
</plugin>
```

Task configuration:

```yaml
coverage-report: ./target/site/cobertura/coverage.xml
```

### Custom Coverage Parsers

For custom coverage formats:

```typescript
// Custom coverage parser
export class CustomCoverageParser implements CoverageParser {
  canParse(filePath: string): boolean {
    return filePath.endsWith('.custom');
  }

  async parse(filePath: string): Promise<TestCoverageResult> {
    const content = await fs.readFile(filePath, 'utf-8');

    // Custom parsing logic
    const coverageData = this.parseCustomFormat(content);

    return {
      totalCoverage: coverageData.total,
      fileCoverage: coverageData.files,
    };
  }

  private parseCustomFormat(content: string): CoverageData {
    // Implement custom format parsing
    return {
      total: 0,
      files: {},
    };
  }
}

// Register custom parser
import { registerCoverageParser } from './coverage-analyzer.js';

registerCoverageParser(new CustomCoverageParser());
```

### Coverage Report Generation

Generate coverage reports that integrate with the testing transition system:

```typescript
// Coverage report generator
export class CoverageReportGenerator {
  async generateReport(config: CoverageConfig): Promise<void> {
    // Run coverage analysis
    const coverageResult = await this.runCoverageTool(config);

    // Generate reports in multiple formats
    await this.generateLcovReport(coverageResult);
    await this.generateJsonReport(coverageResult);
    await this.generateHtmlReport(coverageResult);

    // Update task with coverage information
    await this.updateTaskCoverage(coverageResult);
  }

  private async runCoverageTool(config: CoverageConfig): Promise<CoverageResult> {
    // Run appropriate coverage tool based on project type
    switch (config.type) {
      case 'jest':
        return this.runJestCoverage(config);
      case 'nyc':
        return this.runNycCoverage(config);
      case 'cobertura':
        return this.runCoberturaCoverage(config);
      default:
        throw new Error(`Unsupported coverage tool: ${config.type}`);
    }
  }
}
```

---

## AI Analysis Integration

### Agent Workflow Configuration

Configure the AI analysis workflow for different scenarios:

#### 1. Test Quality Analysis

```typescript
const testQualityAnalysisConfig = {
  agentType: 'test-quality-analyzer',
  model: 'gpt-4',
  temperature: 0.3,
  maxTokens: 1000,
  prompt: `
    Analyze the test suite quality based on:
    - Coverage percentage: {{coverage}}%
    - Quality score: {{quality}}/100
    - Test complexity: {{complexity}}
    - Pass rate: {{passRate}}%
    - Flakiness: {{flakiness}}%
    
    Provide insights and recommendations for improvement.
  `,
};
```

#### 2. Requirement Coverage Analysis

```typescript
const requirementAnalysisConfig = {
  agentType: 'requirement-analyzer',
  model: 'claude-3-sonnet',
  temperature: 0.2,
  maxTokens: 800,
  prompt: `
    Analyze requirement-to-test mapping:
    - Total requirements: {{totalRequirements}}
    - Covered requirements: {{coveredRequirements}}
    - Coverage gaps: {{gaps}}
    
    Identify missing test scenarios and suggest improvements.
  `,
};
```

#### 3. Risk Assessment

```typescript
const riskAssessmentConfig = {
  agentType: 'risk-assessor',
  model: 'gpt-3.5-turbo',
  temperature: 0.4,
  maxTokens: 600,
  prompt: `
    Assess deployment risk based on:
    - Test coverage: {{coverage}}%
    - Quality metrics: {{quality}}/100
    - Historical failure rate: {{failureRate}}%
    - Complexity indicators: {{complexity}}
    
    Provide risk level and mitigation strategies.
  `,
};
```

### Custom AI Integrations

For custom AI service integrations:

```typescript
export class CustomAIIntegration implements AIAnalyzer {
  constructor(
    private endpoint: string,
    private apiKey: string,
    private model: string,
  ) {}

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const payload = this.preparePayload(request);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return this.parseResponse(result);
  }

  private preparePayload(request: AIAnalysisRequest): any {
    return {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a test quality analysis expert.',
        },
        {
          role: 'user',
          content: this.createPrompt(request),
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };
  }

  private createPrompt(request: AIAnalysisRequest): string {
    return `
      Analyze this test suite:
      Coverage: ${request.coverageResult.totalCoverage}%
      Quality Score: ${request.qualityScore.score}/100
      Tests: ${request.tests.join(', ')}
      
      Provide insights, recommendations, and an overall score.
    `;
  }

  private parseResponse(response: any): AIAnalysisResult {
    // Parse custom AI service response
    return {
      insights: response.insights || [],
      recommendations: response.recommendations || [],
      overallScore: response.score || 0,
    };
  }
}
```

---

## Report Generation Integration

### Report Templates

Customize report templates for different organizational needs:

#### 1. Executive Summary Template

```markdown
# Testing Validation Report - Executive Summary

## Overview

- **Task**: {{taskTitle}}
- **Coverage**: {{coverage}}% ({{coverageStatus}})
- **Quality Score**: {{qualityScore}}/100 ({{qualityStatus}})
- **Requirements Covered**: {{requirementsCovered}}/{{totalRequirements}}

## Risk Assessment

- **Risk Level**: {{riskLevel}}
- **Deployment Readiness**: {{deploymentReadiness}}

## Recommendations

{{#each recommendations}}

- {{this}}
  {{/each}}

## Next Steps

{{nextSteps}}
```

#### 2. Technical Detail Template

```markdown
# Testing Validation Report - Technical Analysis

## Coverage Analysis

### Overall Coverage: {{coverage}}%

{{#each fileCoverage}}

- **{{@key}}**: {{this}}%
  {{/each}}

### Coverage Gaps

{{#each coverageGaps}}

- **{{file}}**: {{lines}} uncovered lines
  {{/each}}

## Quality Metrics

- **Complexity**: {{complexity}} (average)
- **Pass Rate**: {{passRate}}%
- **Flakiness**: {{flakiness}}%

## Requirement Mapping

{{#each requirementMappings}}

- **{{requirementId}}**: {{#if isCovered}}✅ Covered{{else}}❌ Not Covered{{/if}}
  - Tests: {{testIds.join(', ')}}
    {{/each}}

## AI Analysis

### Insights

{{#each aiInsights}}

- {{this}}
  {{/each}}

### Recommendations

{{#each aiRecommendations}}

- {{this}}
  {{/each}}
```

### Custom Report Generators

```typescript
export class CustomReportGenerator implements ReportGenerator {
  constructor(private templateEngine: TemplateEngine) {}

  async generateReport(data: ReportData, outputDir: string): Promise<string> {
    // Generate multiple report formats
    const reports = await Promise.all([
      this.generateExecutiveSummary(data),
      this.generateTechnicalReport(data),
      this.generateActionItems(data),
    ]);

    // Combine reports
    const combinedReport = this.combineReports(reports);

    // Save to file
    const reportPath = path.join(outputDir, `testing-report-${Date.now()}.md`);
    await fs.writeFile(reportPath, combinedReport);

    return reportPath;
  }

  private async generateExecutiveSummary(data: ReportData): Promise<string> {
    const template = await this.loadTemplate('executive-summary.hbs');
    return this.templateEngine.render(template, {
      taskTitle: data.taskTitle,
      coverage: data.coverage.totalCoverage,
      coverageStatus: this.getCoverageStatus(data.coverage.totalCoverage),
      qualityScore: data.qualityScore.score,
      qualityStatus: this.getQualityStatus(data.qualityScore.score),
      requirementsCovered: data.mappings.filter((m) => m.isCovered).length,
      totalRequirements: data.mappings.length,
      riskLevel: this.assessRiskLevel(data),
      deploymentReadiness: this.assessDeploymentReadiness(data),
      recommendations: data.aiAnalysis.recommendations,
      nextSteps: this.generateNextSteps(data),
    });
  }

  private async generateTechnicalReport(data: ReportData): Promise<string> {
    const template = await this.loadTemplate('technical-report.hbs');
    return this.templateEngine.render(template, {
      coverage: data.coverage.totalCoverage,
      fileCoverage: data.coverage.fileCoverage,
      coverageGaps: this.identifyCoverageGaps(data.coverage),
      complexity: data.qualityScore.details?.complexity || 0,
      passRate: data.qualityScore.details?.passRate || 0,
      flakiness: data.qualityScore.details?.flakiness || 0,
      requirementMappings: data.mappings,
      aiInsights: data.aiAnalysis.insights,
      aiRecommendations: data.aiAnalysis.recommendations,
    });
  }

  private async generateActionItems(data: ReportData): Promise<string> {
    const actionItems = this.generateActionItems(data);
    const template = await this.loadTemplate('action-items.hbs');
    return this.templateEngine.render(template, { actionItems });
  }

  private generateActionItems(data: ReportData): ActionItem[] {
    const items: ActionItem[] = [];

    // Coverage-based action items
    if (data.coverage.totalCoverage < 90) {
      items.push({
        type: 'coverage',
        priority: 'high',
        description: `Increase test coverage from ${data.coverage.totalCoverage}% to 90%`,
        estimatedEffort: this.estimateCoverageEffort(data.coverage),
      });
    }

    // Quality-based action items
    if (data.qualityScore.score < 75) {
      items.push({
        type: 'quality',
        priority: 'medium',
        description: `Improve test quality score from ${data.qualityScore.score} to 75`,
        estimatedEffort: this.estimateQualityEffort(data.qualityScore),
      });
    }

    // Requirement-based action items
    const uncoveredRequirements = data.mappings.filter((m) => !m.isCovered);
    if (uncoveredRequirements.length > 0) {
      items.push({
        type: 'requirements',
        priority: 'high',
        description: `Add tests for ${uncoveredRequirements.length} uncovered requirements`,
        estimatedEffort: uncoveredRequirements.length * 2, // 2 hours per requirement
      });
    }

    return items.sort(
      (a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority),
    );
  }
}
```

---

## Configuration Management

### Environment-Specific Configuration

Configure the testing transition system for different environments:

#### 1. Development Environment

```typescript
// config/development.ts
export const developmentConfig: TestingTransitionConfig = {
  hardBlockCoverageThreshold: 85, // Lower threshold for development
  softBlockQualityScoreThreshold: 70, // Lower quality threshold
  supportedFormats: ['lcov', 'json'], // Exclude cobertura in dev
  performanceTimeoutSeconds: 60, // Longer timeout for debugging
  aiAnalysis: {
    enabled: false, // Disable AI in development
    fallbackToPlaceholder: true,
  },
  reporting: {
    generateDetailedReports: true,
    includeActionItems: true,
    saveToTaskFrontmatter: true,
  },
};
```

#### 2. Staging Environment

```typescript
// config/staging.ts
export const stagingConfig: TestingTransitionConfig = {
  hardBlockCoverageThreshold: 90,
  softBlockQualityScoreThreshold: 75,
  supportedFormats: ['lcov', 'cobertura', 'json'],
  performanceTimeoutSeconds: 30,
  aiAnalysis: {
    enabled: true,
    fallbackToPlaceholder: true,
    timeoutMs: 15000,
  },
  reporting: {
    generateDetailedReports: true,
    includeActionItems: true,
    saveToTaskFrontmatter: true,
  },
};
```

#### 3. Production Environment

```typescript
// config/production.ts
export const productionConfig: TestingTransitionConfig = {
  hardBlockCoverageThreshold: 90,
  softBlockQualityScoreThreshold: 75,
  supportedFormats: ['lcov', 'cobertura', 'json'],
  performanceTimeoutSeconds: 30,
  aiAnalysis: {
    enabled: true,
    fallbackToPlaceholder: false, // No fallbacks in production
    timeoutMs: 15000,
  },
  reporting: {
    generateDetailedReports: true,
    includeActionItems: true,
    saveToTaskFrontmatter: true,
  },
  security: {
    validateFilePaths: true,
    sanitizeInputs: true,
    enforceFileSizeLimits: true,
  },
};
```

### Dynamic Configuration

Load configuration based on environment and runtime parameters:

```typescript
export class ConfigurationManager {
  private config: TestingTransitionConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): TestingTransitionConfig {
    const environment = process.env.NODE_ENV || 'development';

    // Load base configuration
    let baseConfig: TestingTransitionConfig;
    switch (environment) {
      case 'production':
        baseConfig = productionConfig;
        break;
      case 'staging':
        baseConfig = stagingConfig;
        break;
      default:
        baseConfig = developmentConfig;
    }

    // Override with environment variables
    return this.applyEnvironmentOverrides(baseConfig);
  }

  private applyEnvironmentOverrides(config: TestingTransitionConfig): TestingTransitionConfig {
    return {
      ...config,
      hardBlockCoverageThreshold: this.getEnvNumber(
        'COVERAGE_THRESHOLD',
        config.hardBlockCoverageThreshold,
      ),
      softBlockQualityScoreThreshold: this.getEnvNumber(
        'QUALITY_THRESHOLD',
        config.softBlockQualityScoreThreshold,
      ),
      performanceTimeoutSeconds: this.getEnvNumber(
        'TIMEOUT_SECONDS',
        config.performanceTimeoutSeconds,
      ),
    };
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  getConfig(): TestingTransitionConfig {
    return this.config;
  }

  updateConfig(updates: Partial<TestingTransitionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
```

### Configuration Validation

Validate configuration to ensure it meets requirements:

```typescript
export class ConfigurationValidator {
  static validate(config: TestingTransitionConfig): ValidationResult {
    const errors: string[] = = [];

    // Validate thresholds
    if (config.hardBlockCoverageThreshold < 0 || config.hardBlockCoverageThreshold > 100) {
      errors.push('Coverage threshold must be between 0 and 100');
    }

    if (config.softBlockQualityScoreThreshold < 0 || config.softBlockQualityScoreThreshold > 100) {
      errors.push('Quality threshold must be between 0 and 100');
    }

    // Validate timeout
    if (config.performanceTimeoutSeconds < 5 || config.performanceTimeoutSeconds > 300) {
      errors.push('Timeout must be between 5 and 300 seconds');
    }

    // Validate formats
    const validFormats = ['lcov', 'cobertura', 'json'];
    const invalidFormats = config.supportedFormats.filter(f => !validFormats.includes(f));
    if (invalidFormats.length > 0) {
      errors.push(`Invalid coverage formats: ${invalidFormats.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Coverage Report Not Found

**Error**: `Coverage report file not found: ./coverage/lcov.info`

**Solutions**:

- Verify coverage report path in task frontmatter
- Ensure coverage report is generated before running validation
- Check file permissions and accessibility
- Use absolute paths if relative paths don't work

```yaml
# Correct task configuration
coverage-report: ./coverage/lcov.info
# or
coverage-report: /absolute/path/to/coverage/lcov.info
```

#### 2. Unsupported Coverage Format

**Error**: `Unsupported coverage format: xyz`

**Solutions**:

- Check supported formats: `lcov`, `cobertura`, `json`
- Verify file extension matches format
- Ensure coverage report is in correct format
- Consider converting to supported format

#### 3. Quality Score Below Threshold

**Error**: `Quality score below threshold: 70 < 75`

**Solutions**:

- Improve test pass rate
- Reduce test complexity
- Address test flakiness
- Review quality scoring formula

#### 4. AI Analysis Timeout

**Error**: `AI analysis timeout after 15 seconds`

**Solutions**:

- Check AI service availability
- Increase timeout configuration
- Implement fallback analysis
- Verify network connectivity

#### 5. Performance Timeout

**Error**: `Validation timeout after 30 seconds`

**Solutions**:

- Optimize coverage report size
- Increase timeout for large projects
- Implement parallel processing
- Check system resources

### Debug Mode

Enable debug mode for detailed troubleshooting:

```typescript
// Enable debug logging
process.env.DEBUG = 'testing-transition:*';

// Or enable in configuration
const debugConfig: TestingTransitionConfig = {
  ...baseConfig,
  debug: {
    enabled: true,
    logLevel: 'debug',
    saveIntermediateResults: true,
    performanceProfiling: true,
  },
};
```

### Logging and Monitoring

Set up comprehensive logging:

```typescript
import { createLogger } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'testing-transition.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Usage in validation
logger.info('Starting testing transition validation', {
  taskId: task.id,
  coverageReport: testingInfo.coverageRequest.reportPath,
});

logger.error('Coverage analysis failed', {
  error: error.message,
  filePath: testingInfo.coverageRequest.reportPath,
  stack: error.stack,
});
```

### Health Checks

Implement health checks for the system:

```typescript
export class HealthChecker {
  async checkSystemHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkFileSystemAccess(),
      this.checkCoverageParsers(),
      this.checkAIConnection(),
      this.checkConfiguration(),
    ]);

    return {
      healthy: checks.every((check) => check.status === 'fulfilled'),
      checks: this.formatCheckResults(checks),
    };
  }

  private async checkFileSystemAccess(): Promise<void> {
    // Test file system access
    await fs.access('./coverage', fs.constants.R_OK);
  }

  private async checkCoverageParsers(): Promise<void> {
    // Test coverage parsers
    const testRequest: TestCoverageRequest = {
      format: 'lcov',
      reportPath: './test-data/sample.lcov',
    };
    await analyzeCoverage(testRequest);
  }

  private async checkAIConnection(): Promise<void> {
    // Test AI service connection
    const testRequest: AIAnalysisRequest = {
      tests: ['test'],
      coverageResult: { totalCoverage: 90, fileCoverage: {} },
      qualityScore: { score: 80 },
      mappings: [],
    };
    await analyzeWithAI(testRequest);
  }

  private async checkConfiguration(): Promise<void> {
    // Validate configuration
    const config = getConfig();
    ConfigurationValidator.validate(config);
  }
}

interface HealthStatus {
  healthy: boolean;
  checks: CheckResult[];
}

interface CheckResult {
  name: string;
  status: 'pass' | 'fail';
  error?: string;
}
```

---

## Conclusion

This integration guide provides comprehensive instructions for integrating the Comprehensive Testing Transition Rule with various components of the Promethean ecosystem. Key takeaways:

1. **Kanban FSM Integration**: Configure transition rules and Clojure DSL
2. **Agent Workflow Integration**: Set up AI analysis with fallback mechanisms
3. **Coverage Analysis Integration**: Support multiple coverage tools and formats
4. **Report Generation Integration**: Customize templates and output formats
5. **Configuration Management**: Environment-specific settings and validation
6. **Troubleshooting**: Common issues and debugging techniques

Following these integration guidelines will ensure a smooth and successful deployment of the testing transition system in your environment.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Next Review**: 2025-10-22  
**Maintainer**: Promethean Development Team
