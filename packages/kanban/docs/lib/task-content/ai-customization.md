# AI Customization Guide

Learn how to extend and customize the TaskAIManager for your specific needs.

## Extending Analysis Types

### Adding Custom Analysis Types

```typescript
// src/lib/task-content/custom-analysis.ts
import type { TaskAnalysisRequest, TaskAnalysisResult } from './types.js';

// Extend the analysis request type
interface CustomAnalysisRequest extends TaskAnalysisRequest {
  analysisType:
    | 'quality'
    | 'complexity'
    | 'completeness'
    | 'security'
    | 'performance'
    | 'accessibility';
}

// Extend the analysis result type
interface CustomAnalysisResult extends TaskAnalysisResult {
  analysis: {
    qualityScore?: number;
    complexityScore?: number;
    completenessScore?: number;
    securityScore?: number; // New: Security assessment
    performanceScore?: number; // New: Performance impact
    accessibilityScore?: number; // New: Accessibility compliance
    estimatedEffort?: {
      hours: number;
      confidence: number;
      breakdown: string[];
    };
    suggestions: string[];
    risks: string[];
    dependencies: string[];
    subtasks: string[];
    securityIssues?: Array<{
      // New: Security findings
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
    performanceImpacts?: Array<{
      // New: Performance impacts
      metric: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }>;
  };
}
```

### Implementing Custom Analysis Logic

```typescript
// src/lib/task-content/custom-analysis-generator.ts
import type { Task } from '../types.js';

type CustomAnalysisParams = {
  task: Task;
  analysisType: string;
  context: Record<string, unknown>;
};

export function generateCustomAnalysis(params: CustomAnalysisParams): any {
  const { task, analysisType } = params;
  const contentLength = task.content?.length ?? 0;

  switch (analysisType) {
    case 'security':
      return generateSecurityAnalysis(task, contentLength);

    case 'performance':
      return generatePerformanceAnalysis(task, contentLength);

    case 'accessibility':
      return generateAccessibilityAnalysis(task, contentLength);

    default:
      return generateStandardAnalysis(params);
  }
}

function generateSecurityAnalysis(task: Task, contentLength: number) {
  const securityKeywords = ['password', 'token', 'auth', 'encryption', 'ssl', 'https'];
  const securityMentions = securityKeywords.filter(
    (keyword) => task.content?.toLowerCase().includes(keyword) || false,
  ).length;

  const securityScore = Math.max(0, 100 - securityMentions * 5);

  const securityIssues = [];

  // Check for common security issues
  if (!task.content?.toLowerCase().includes('https')) {
    securityIssues.push({
      severity: 'medium',
      description: 'Task does not mention HTTPS usage',
      recommendation: 'Consider security implications of data transmission',
    });
  }

  if (
    task.content?.toLowerCase().includes('password') &&
    !task.content?.toLowerCase().includes('encrypted')
  ) {
    securityIssues.push({
      severity: 'high',
      description: 'Password mentioned without encryption context',
      recommendation: 'Specify password storage and encryption requirements',
    });
  }

  return {
    securityScore,
    securityIssues,
    suggestions: [
      'Include security requirements in acceptance criteria',
      'Document authentication and authorization needs',
      'Consider data protection requirements',
    ],
    risks: securityIssues.map((issue) => issue.description),
    dependencies: [],
    subtasks: [],
  };
}

function generatePerformanceAnalysis(task: Task, contentLength: number) {
  const performanceKeywords = ['optimization', 'cache', 'performance', 'speed', 'latency'];
  const performanceMentions = performanceKeywords.filter(
    (keyword) => task.content?.toLowerCase().includes(keyword) || false,
  ).length;

  const performanceScore = Math.min(100, 50 + performanceMentions * 10);

  const performanceImpacts = [];

  // Analyze performance implications
  if (task.content?.toLowerCase().includes('database')) {
    performanceImpacts.push({
      metric: 'Database Performance',
      impact: 'neutral',
      description: 'Task involves database operations',
    });
  }

  if (task.content?.toLowerCase().includes('api')) {
    performanceImpacts.push({
      metric: 'API Response Time',
      impact: task.content?.toLowerCase().includes('optimization') ? 'positive' : 'neutral',
      description: 'Task affects API performance',
    });
  }

  return {
    performanceScore,
    performanceImpacts,
    suggestions: [
      'Define performance requirements and benchmarks',
      'Consider caching strategies',
      'Document monitoring and measurement approaches',
    ],
    risks: ['Performance requirements may be unclear'],
    dependencies: [],
    subtasks: [],
  };
}

function generateAccessibilityAnalysis(task: Task, contentLength: number) {
  const accessibilityKeywords = ['a11y', 'wcag', 'screen reader', 'keyboard', 'contrast'];
  const accessibilityMentions = accessibilityKeywords.filter(
    (keyword) => task.content?.toLowerCase().includes(keyword) || false,
  ).length;

  const accessibilityScore = Math.min(100, 40 + accessibilityMentions * 15);

  return {
    accessibilityScore,
    suggestions: [
      'Include WCAG compliance requirements',
      'Consider screen reader compatibility',
      'Document keyboard navigation requirements',
      'Specify color contrast and visual accessibility needs',
    ],
    risks: ['Accessibility requirements may be incomplete'],
    dependencies: [],
    subtasks: [],
  };
}
```

### Extending the TaskAIManager

```typescript
// src/lib/task-content/enhanced-ai-manager.ts
import { TaskAIManager } from './ai.js';
import type {
  TaskAnalysisRequest,
  TaskAnalysisResult,
  TaskRewriteRequest,
  TaskRewriteResult,
  TaskBreakdownRequest,
  TaskBreakdownResult,
} from './types.js';
import { generateCustomAnalysis } from './custom-analysis-generator.js';

export class EnhancedTaskAIManager extends TaskAIManager {
  // Override analyzeTask to support custom types
  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    const startTime = Date.now();
    const { uuid, analysisType, context = {}, options = {} } = request;

    try {
      const task = await this.contentManager.readTask(uuid);
      if (!task) {
        return this.createErrorResult(uuid, analysisType, startTime, `Task ${uuid} not found`);
      }

      // Use custom analysis for new types
      if (['security', 'performance', 'accessibility'].includes(analysisType)) {
        const customAnalysis = await this.runCustomAnalysis({
          task,
          analysisType,
          context,
        });

        return {
          success: true,
          taskUuid: uuid,
          analysisType,
          analysis: customAnalysis,
          metadata: {
            analyzedAt: new Date(),
            analyzedBy: process.env.AGENT_NAME || 'unknown',
            model: this.config.model,
            processingTime: Date.now() - startTime,
          },
        };
      }

      // Fall back to parent implementation for standard types
      return super.analyzeTask(request);
    } catch (error) {
      return this.createErrorResult(
        uuid,
        analysisType,
        startTime,
        error instanceof Error ? error.message : 'Unknown error during analysis',
      );
    }
  }

  private async runCustomAnalysis(params: {
    task: any;
    analysisType: string;
    context: Record<string, unknown>;
  }) {
    return await runPantheonComputation({
      actorName: 'enhanced-task-analysis',
      goal: `perform ${params.analysisType} analysis for ${params.task.title}`,
      compute: async () => generateCustomAnalysis(params),
    });
  }

  private createErrorResult(
    uuid: string,
    analysisType: string,
    startTime: number,
    error: string,
  ): TaskAnalysisResult {
    return {
      success: false,
      taskUuid: uuid,
      analysisType,
      analysis: {
        suggestions: [],
        risks: [],
        dependencies: [],
        subtasks: [],
      },
      metadata: {
        analyzedAt: new Date(),
        analyzedBy: process.env.AGENT_NAME || 'unknown',
        model: this.config.model,
        processingTime: Date.now() - startTime,
      },
      error,
    };
  }
}
```

## Custom Rewrite Types

### Adding Domain-Specific Rewrite Types

```typescript
// src/lib/task-content/custom-rewrite-types.ts
import type { TaskRewriteRequest } from './types.js';

interface CustomRewriteRequest extends TaskRewriteRequest {
  rewriteType:
    | 'improve'
    | 'simplify'
    | 'expand'
    | 'restructure'
    | 'summarize'
    | 'security-focused'
    | 'performance-optimized'
    | 'accessibility-enhanced'
    | 'api-documentation'
    | 'user-manual'
    | 'test-plan';
}

interface SecurityFocusedRewriteRequest extends TaskRewriteRequest {
  rewriteType: 'security-focused';
  securityLevel?: 'basic' | 'standard' | 'high' | 'critical';
  complianceStandards?: string[]; // e.g., ['SOC2', 'GDPR', 'HIPAA']
}

interface PerformanceOptimizedRewriteRequest extends TaskRewriteRequest {
  rewriteType: 'performance-optimized';
  performanceTargets?: {
    responseTime?: number; // Target response time in ms
    throughput?: number; // Target requests per second
    resourceUsage?: string; // Memory/CPU limits
  };
}

interface APIDocumentationRewriteRequest extends TaskRewriteRequest {
  rewriteType: 'api-documentation';
  apiSpec?: {
    version: string;
    baseUrl: string;
    authentication: string;
  };
}
```

### Implementing Custom Rewrite Logic

```typescript
// src/lib/task-content/custom-rewrite-generator.ts
import type { TaskRewriteParams } from './ai.js';

export function generateCustomRewrite(params: TaskRewriteParams): {
  content: string;
  summary: string;
} {
  const { task, rewriteType, instructions, targetAudience, tone, originalContent } = params;

  switch (rewriteType) {
    case 'security-focused':
      return generateSecurityRewrite(params);

    case 'performance-optimized':
      return generatePerformanceRewrite(params);

    case 'accessibility-enhanced':
      return generateAccessibilityRewrite(params);

    case 'api-documentation':
      return generateAPIDocumentationRewrite(params);

    case 'test-plan':
      return generateTestPlanRewrite(params);

    default:
      return generateStandardRewrite(params);
  }
}

function generateSecurityRewrite(params: TaskRewriteParams): { content: string; summary: string } {
  const { task, originalContent } = params;

  const securityContent = `
## Security Requirements

### Authentication & Authorization
- Define user roles and permissions
- Specify authentication methods (OAuth, JWT, API keys)
- Document authorization flows and access controls

### Data Protection
- Encrypt sensitive data at rest and in transit
- Define data retention and deletion policies
- Specify compliance requirements (GDPR, SOC2, etc.)

### Security Testing
- Include security testing in acceptance criteria
- Define penetration testing requirements
- Document security monitoring and logging

### Risk Assessment
- Identify potential security vulnerabilities
- Document mitigation strategies
- Define incident response procedures
`;

  const rewrittenContent = `## Security-Enhanced Task: ${task.title}

${originalContent.trim()}

${securityContent}

### Notes
- Security considerations integrated by AI
- Review security requirements with security team
- Update based on threat model assessment`;

  return {
    content: rewrittenContent,
    summary:
      'Enhanced task with comprehensive security requirements, authentication specifications, and compliance considerations',
  };
}

function generatePerformanceRewrite(params: TaskRewriteParams): {
  content: string;
  summary: string;
} {
  const { task, originalContent } = params;

  const performanceContent = `
## Performance Requirements

### Performance Targets
- Define response time requirements (e.g., < 200ms for API calls)
- Specify throughput targets (e.g., 1000 requests/second)
- Document resource utilization limits

### Optimization Strategies
- Identify performance bottlenecks
- Specify caching strategies
- Define database optimization requirements

### Monitoring & Measurement
- Define performance metrics and KPIs
- Specify monitoring tools and approaches
- Document performance testing procedures

### Scalability Considerations
- Define load testing requirements
- Specify horizontal/vertical scaling strategies
- Document performance under different load conditions
`;

  const rewrittenContent = `## Performance-Optimized Task: ${task.title}

${originalContent.trim()}

${performanceContent}

### Notes
- Performance requirements and targets defined
- Optimization strategies documented
- Monitoring and measurement approaches specified`;

  return {
    content: rewrittenContent,
    summary:
      'Optimized task with performance targets, optimization strategies, and monitoring requirements',
  };
}

function generateAPIDocumentationRewrite(params: TaskRewriteParams): {
  content: string;
  summary: string;
} {
  const { task, originalContent } = params;

  const apiContent = `
## API Documentation

### Endpoint Specification
\`\`\`markdown
### Method: [METHOD] /path/to/endpoint

#### Description
[Brief description of what this endpoint does]

#### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | Description of parameter 1 |
| param2 | number | No | Description of parameter 2 |

#### Response
\`\`\`json
{
  "field1": "value1",
  "field2": "value2"
}
\`\`\`

#### Error Responses
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |
\`\`\`

### Authentication
- Specify authentication method (Bearer token, API key, etc.)
- Document required headers and parameters
- Provide example authentication flows

### Rate Limiting
- Define rate limits per endpoint
- Document rate limit headers
- Specify retry strategies

### Examples
\`\`\`bash
curl -X GET https://api.example.com/endpoint \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json"
\`\`\`
`;

  const rewrittenContent = `## API Documentation Task: ${task.title}

${originalContent.trim()}

${apiContent}

### Implementation Notes
- Follow REST API design principles
- Include comprehensive error handling
- Provide clear examples and documentation`;

  return {
    content: rewrittenContent,
    summary:
      'Structured task with comprehensive API documentation including endpoints, authentication, and examples',
  };
}
```

## Custom Breakdown Types

### Adding Specialized Breakdown Types

```typescript
// src/lib/task-content/custom-breakdown-types.ts
import type { TaskBreakdownRequest } from './types.js';

interface CustomBreakdownRequest extends TaskBreakdownRequest {
  breakdownType:
    | 'subtasks'
    | 'steps'
    | 'phases'
    | 'components'
    | 'security-tasks'
    | 'performance-tasks'
    | 'test-cases'
    | 'api-endpoints'
    | 'user-stories';
}

interface SecurityTasksBreakdownRequest extends TaskBreakdownRequest {
  breakdownType: 'security-tasks';
  securityAreas?: Array<'authentication' | 'authorization' | 'data-protection' | 'testing'>;
}

interface TestCasesBreakdownRequest extends TaskBreakdownRequest {
  breakdownType: 'test-cases';
  testTypes?: Array<'unit' | 'integration' | 'e2e' | 'performance' | 'security'>;
  coverageTarget?: number; // Target test coverage percentage
}

interface APIEndpointsBreakdownRequest extends TaskBreakdownRequest {
  breakdownType: 'api-endpoints';
  apiSpec?: {
    resource: string; // e.g., 'users', 'orders', 'products'
    operations: string[]; // e.g., ['GET', 'POST', 'PUT', 'DELETE']
  };
}
```

### Implementing Custom Breakdown Logic

```typescript
// src/lib/task-content/custom-breakdown-generator.ts
import type { TaskBreakdownParams } from './ai.js';

export function generateCustomBreakdown(params: TaskBreakdownParams): { subtasks: any[] } {
  const { task, breakdownType, maxSubtasks, complexity, includeEstimates } = params;

  switch (breakdownType) {
    case 'security-tasks':
      return generateSecurityTasksBreakdown(params);

    case 'test-cases':
      return generateTestCasesBreakdown(params);

    case 'api-endpoints':
      return generateAPIEndpointsBreakdown(params);

    case 'user-stories':
      return generateUserStoriesBreakdown(params);

    default:
      return generateStandardBreakdown(params);
  }
}

function generateSecurityTasksBreakdown(params: TaskBreakdownParams): { subtasks: any[] } {
  const { task, maxSubtasks = 6, includeEstimates } = params;

  const baseEstimate = includeEstimates ? 4 : undefined;

  const subtasks = [
    {
      title: 'Security Requirements Analysis',
      description: 'Identify and document all security requirements for the task',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'high' as const,
      dependencies: [],
      acceptanceCriteria: [
        'Security requirements documented',
        'Threat model completed',
        'Compliance standards identified',
      ],
    },
    {
      title: 'Authentication Implementation',
      description: 'Implement secure authentication mechanisms',
      estimatedHours: includeEstimates ? baseEstimate + 2 : undefined,
      priority: 'high' as const,
      dependencies: ['Security Requirements Analysis'],
      acceptanceCriteria: [
        'Authentication system implemented',
        'Password policies enforced',
        'Multi-factor authentication configured',
      ],
    },
    {
      title: 'Authorization & Access Control',
      description: 'Implement role-based access control and permissions',
      estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
      priority: 'high' as const,
      dependencies: ['Authentication Implementation'],
      acceptanceCriteria: [
        'Role-based permissions defined',
        'Access control lists implemented',
        'Permission testing completed',
      ],
    },
    {
      title: 'Data Protection Implementation',
      description: 'Implement encryption and data protection measures',
      estimatedHours: includeEstimates ? baseEstimate + 3 : undefined,
      priority: 'high' as const,
      dependencies: ['Authorization & Access Control'],
      acceptanceCriteria: [
        'Data encryption implemented',
        'Secure transmission protocols used',
        'Data retention policies defined',
      ],
    },
    {
      title: 'Security Testing',
      description: 'Perform comprehensive security testing and vulnerability assessment',
      estimatedHours: includeEstimates ? baseEstimate + 2 : undefined,
      priority: 'medium' as const,
      dependencies: ['Data Protection Implementation'],
      acceptanceCriteria: [
        'Penetration testing completed',
        'Vulnerability assessment performed',
        'Security issues remediated',
      ],
    },
    {
      title: 'Security Documentation',
      description: 'Document security architecture and procedures',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'medium' as const,
      dependencies: ['Security Testing'],
      acceptanceCriteria: [
        'Security architecture documented',
        'Incident response procedures defined',
        'Compliance documentation completed',
      ],
    },
  ].slice(0, maxSubtasks);

  return { subtasks };
}

function generateTestCasesBreakdown(params: TaskBreakdownParams): { subtasks: any[] } {
  const { task, maxSubtasks = 8, includeEstimates } = params;

  const baseEstimate = includeEstimates ? 2 : undefined;

  const subtasks = [
    {
      title: 'Unit Test Planning',
      description: 'Plan comprehensive unit test coverage for all components',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'high' as const,
      dependencies: [],
      acceptanceCriteria: [
        'Test cases identified for all functions',
        'Edge cases documented',
        'Test data requirements defined',
      ],
    },
    {
      title: 'Unit Test Implementation',
      description: 'Write unit tests for all business logic and utility functions',
      estimatedHours: includeEstimates ? baseEstimate * 3 : undefined,
      priority: 'high' as const,
      dependencies: ['Unit Test Planning'],
      acceptanceCriteria: [
        'Unit tests written for all functions',
        'Test coverage > 80%',
        'All tests passing',
      ],
    },
    {
      title: 'Integration Test Development',
      description: 'Create integration tests for component interactions',
      estimatedHours: includeEstimates ? baseEstimate * 2 : undefined,
      priority: 'medium' as const,
      dependencies: ['Unit Test Implementation'],
      acceptanceCriteria: [
        'Integration tests for all APIs',
        'Database integration tested',
        'External service integration tested',
      ],
    },
    {
      title: 'End-to-End Test Scenarios',
      description: 'Develop comprehensive E2E test scenarios',
      estimatedHours: includeEstimates ? baseEstimate * 2 : undefined,
      priority: 'medium' as const,
      dependencies: ['Integration Test Development'],
      acceptanceCriteria: [
        'User workflows tested end-to-end',
        'Critical paths covered',
        'Error scenarios tested',
      ],
    },
    {
      title: 'Performance Testing',
      description: 'Conduct performance and load testing',
      estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
      priority: 'medium' as const,
      dependencies: ['End-to-End Test Scenarios'],
      acceptanceCriteria: [
        'Load testing completed',
        'Performance benchmarks established',
        'Bottlenecks identified',
      ],
    },
    {
      title: 'Security Testing',
      description: 'Perform security vulnerability testing',
      estimatedHours: includeEstimates ? baseEstimate + 2 : undefined,
      priority: 'high' as const,
      dependencies: ['Performance Testing'],
      acceptanceCriteria: [
        'Security scanning completed',
        'Authentication tested',
        'Authorization tested',
      ],
    },
    {
      title: 'Test Documentation',
      description: 'Document test procedures and results',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'low' as const,
      dependencies: ['Security Testing'],
      acceptanceCriteria: [
        'Test procedures documented',
        'Test results recorded',
        'Quality metrics reported',
      ],
    },
    {
      title: 'Test Automation Setup',
      description: 'Configure automated test execution in CI/CD pipeline',
      estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
      priority: 'medium' as const,
      dependencies: ['Test Documentation'],
      acceptanceCriteria: [
        'Automated test pipeline configured',
        'Tests run on every commit',
        'Test reports generated',
      ],
    },
  ].slice(0, maxSubtasks);

  return { subtasks };
}

function generateAPIEndpointsBreakdown(params: TaskBreakdownParams): { subtasks: any[] } {
  const { task, maxSubtasks = 6, includeEstimates } = params;

  const baseEstimate = includeEstimates ? 3 : undefined;

  const subtasks = [
    {
      title: 'API Design & Specification',
      description: 'Design RESTful API endpoints and data models',
      estimatedHours: includeEstimates ? baseEstimate + 2 : undefined,
      priority: 'high' as const,
      dependencies: [],
      acceptanceCriteria: [
        'API endpoints designed',
        'Data models defined',
        'OpenAPI specification created',
      ],
    },
    {
      title: 'Authentication Endpoints',
      description: 'Implement authentication and authorization endpoints',
      estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
      priority: 'high' as const,
      dependencies: ['API Design & Specification'],
      acceptanceCriteria: [
        'Login/logout endpoints implemented',
        'Token refresh mechanism working',
        'Password reset functionality',
      ],
    },
    {
      title: 'Core Resource Endpoints',
      description: 'Implement CRUD operations for primary resources',
      estimatedHours: includeEstimates ? baseEstimate * 2 : undefined,
      priority: 'high' as const,
      dependencies: ['Authentication Endpoints'],
      acceptanceCriteria: [
        'GET endpoints implemented',
        'POST endpoints implemented',
        'PUT/PATCH endpoints implemented',
        'DELETE endpoints implemented',
      ],
    },
    {
      title: 'Validation & Error Handling',
      description: 'Implement input validation and comprehensive error responses',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'medium' as const,
      dependencies: ['Core Resource Endpoints'],
      acceptanceCriteria: [
        'Input validation implemented',
        'Error responses standardized',
        'HTTP status codes correct',
      ],
    },
    {
      title: 'API Documentation',
      description: 'Create comprehensive API documentation',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'medium' as const,
      dependencies: ['Validation & Error Handling'],
      acceptanceCriteria: [
        'OpenAPI specification complete',
        'Endpoint documentation written',
        'Examples and tutorials provided',
      ],
    },
    {
      title: 'API Testing & Quality Assurance',
      description: 'Test all endpoints and ensure quality standards',
      estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
      priority: 'medium' as const,
      dependencies: ['API Documentation'],
      acceptanceCriteria: [
        'All endpoints tested',
        'Integration tests passing',
        'Performance benchmarks met',
      ],
    },
  ].slice(0, maxSubtasks);

  return { subtasks };
}
```

## Custom Model Integration

### Supporting Different AI Models

```typescript
// src/lib/task-content/model-adapter.ts
export interface ModelAdapter {
  name: string;
  analyze(request: any): Promise<any>;
  rewrite(request: any): Promise<any>;
  breakdown(request: any): Promise<any>;
}

export class OllamaAdapter implements ModelAdapter {
  name = 'ollama';

  constructor(private config: any) {}

  async analyze(request: any) {
    return await runPantheonComputation({
      actorName: 'ollama-analysis',
      goal: `analyze task using ${this.config.model}`,
      compute: async () => this.callOllama('analyze', request),
    });
  }

  async rewrite(request: any) {
    return await runPantheonComputation({
      actorName: 'ollama-rewrite',
      goal: `rewrite task using ${this.config.model}`,
      compute: async () => this.callOllama('rewrite', request),
    });
  }

  async breakdown(request: any) {
    return await runPantheonComputation({
      actorName: 'ollama-breakdown',
      goal: `breakdown task using ${this.config.model}`,
      compute: async () => this.callOllama('breakdown', request),
    });
  }

  private async callOllama(operation: string, request: any) {
    // Implementation for calling Ollama API
    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt: this.createPrompt(operation, request),
        stream: false,
      }),
    });

    return await response.json();
  }

  private createPrompt(operation: string, request: any): string {
    // Create model-specific prompts
    switch (operation) {
      case 'analyze':
        return `Analyze this task for quality: ${JSON.stringify(request)}`;
      case 'rewrite':
        return `Rewrite this task: ${JSON.stringify(request)}`;
      case 'breakdown':
        return `Break down this task: ${JSON.stringify(request)}`;
      default:
        return `Process this task: ${JSON.stringify(request)}`;
    }
  }
}

export class OpenAIAdapter implements ModelAdapter {
  name = 'openai';

  constructor(private config: any) {}

  async analyze(request: any) {
    // Implementation for OpenAI API
    return this.callOpenAI('analyze', request);
  }

  async rewrite(request: any) {
    return this.callOpenAI('rewrite', request);
  }

  async breakdown(request: any) {
    return this.callOpenAI('breakdown', request);
  }

  private async callOpenAI(operation: string, request: any) {
    // Implementation for calling OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: this.createPrompt(operation, request),
          },
        ],
      }),
    });

    return await response.json();
  }

  private createPrompt(operation: string, request: any): string {
    // OpenAI-specific prompt creation
    return `You are an expert software development assistant. ${this.createOperationPrompt(operation, request)}`;
  }

  private createOperationPrompt(operation: string, request: any): string {
    switch (operation) {
      case 'analyze':
        return `Analyze this task for quality and provide detailed feedback: ${JSON.stringify(request)}`;
      case 'rewrite':
        return `Rewrite this task to improve clarity and completeness: ${JSON.stringify(request)}`;
      case 'breakdown':
        return `Break down this task into manageable subtasks: ${JSON.stringify(request)}`;
      default:
        return `Process this task: ${JSON.stringify(request)}`;
    }
  }
}
```

### Multi-Model AI Manager

```typescript
// src/lib/task-content/multi-model-ai-manager.ts
import { TaskAIManager } from './ai.js';
import { ModelAdapter, OllamaAdapter, OpenAIAdapter } from './model-adapter.js';

export class MultiModelTaskAIManager extends TaskAIManager {
  private adapters: Map<string, ModelAdapter> = new Map();
  private defaultModel: string;

  constructor(config: any) {
    super(config);
    this.defaultModel = config.model || 'qwen3:8b';

    // Initialize adapters
    this.adapters.set('ollama', new OllamaAdapter(config));
    this.adapters.set('openai', new OpenAIAdapter(config));
  }

  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    const model = this.selectModel(request);
    const adapter = this.adapters.get(model);

    if (!adapter) {
      throw new Error(`Unknown model: ${model}`);
    }

    return await adapter.analyze(request);
  }

  async rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult> {
    const model = this.selectModel(request);
    const adapter = this.adapters.get(model);

    if (!adapter) {
      throw new Error(`Unknown model: ${model}`);
    }

    return await adapter.rewrite(request);
  }

  async breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult> {
    const model = this.selectModel(request);
    const adapter = this.adapters.get(model);

    if (!adapter) {
      throw new Error(`Unknown model: ${model}`);
    }

    return await adapter.breakdown(request);
  }

  private selectModel(request: any): string {
    // Model selection logic based on request type or content
    if (request.model) {
      return request.model;
    }

    // Use different models for different types of tasks
    if (request.analysisType === 'security') {
      return 'openai'; // Use GPT-4 for security analysis
    }

    if (request.rewriteType === 'api-documentation') {
      return 'openai'; // Use GPT-4 for documentation
    }

    return this.defaultModel; // Use default for other cases
  }

  addAdapter(name: string, adapter: ModelAdapter) {
    this.adapters.set(name, adapter);
  }

  listModels(): string[] {
    return Array.from(this.adapters.keys());
  }
}
```

## Configuration Customization

### Dynamic Configuration Loading

```typescript
// src/lib/task-content/config-loader.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface AIConfigProfile {
  name: string;
  description: string;
  model: string;
  baseUrl: string;
  timeout: number;
  maxTokens: number;
  temperature: number;
  specializations?: string[]; // e.g., ['security', 'performance', 'documentation']
}

export class AIConfigLoader {
  private profiles: Map<string, AIConfigProfile> = new Map();

  constructor(configPath?: string) {
    this.loadProfiles(configPath || './ai-configs.json');
  }

  private loadProfiles(configPath: string) {
    try {
      const configData = readFileSync(configPath, 'utf8');
      const configs = JSON.parse(configData);

      Object.entries(configs).forEach(([name, profile]: [string, any]) => {
        this.profiles.set(name, {
          name,
          description: profile.description || '',
          model: profile.model || 'qwen3:8b',
          baseUrl: profile.baseUrl || 'http://localhost:11434',
          timeout: profile.timeout || 60000,
          maxTokens: profile.maxTokens || 4096,
          temperature: profile.temperature || 0.3,
          specializations: profile.specializations || [],
        });
      });
    } catch (error) {
      console.warn(`Failed to load AI configs: ${error}`);
    }
  }

  getProfile(name: string): AIConfigProfile | undefined {
    return this.profiles.get(name);
  }

  listProfiles(): AIConfigProfile[] {
    return Array.from(this.profiles.values());
  }

  getBestProfileForTask(taskType: string, specialization?: string): AIConfigProfile {
    // Find best profile based on task type and specialization
    const candidates = Array.from(this.profiles.values()).filter(
      (profile) => !specialization || profile.specializations?.includes(specialization),
    );

    if (candidates.length === 0) {
      return this.profiles.get('default') || this.profiles.values().next().value;
    }

    // Prefer profiles with specific specializations
    const specialized = candidates.filter((p) => p.specializations?.includes(specialization));
    if (specialized.length > 0) {
      return specialized[0];
    }

    return candidates[0];
  }
}
```

### Example Configuration File

```json
// ai-configs.json
{
  "default": {
    "name": "Default",
    "description": "General purpose AI configuration",
    "model": "qwen3:8b",
    "baseUrl": "http://localhost:11434",
    "timeout": 60000,
    "maxTokens": 4096,
    "temperature": 0.3
  },
  "security": {
    "name": "Security Specialist",
    "description": "Optimized for security analysis and tasks",
    "model": "gpt-4",
    "baseUrl": "https://api.openai.com/v1",
    "timeout": 120000,
    "maxTokens": 8192,
    "temperature": 0.1,
    "specializations": ["security", "compliance", "risk-assessment"]
  },
  "documentation": {
    "name": "Documentation Specialist",
    "description": "Optimized for generating documentation",
    "model": "gpt-4",
    "baseUrl": "https://api.openai.com/v1",
    "timeout": 90000,
    "maxTokens": 6144,
    "temperature": 0.2,
    "specializations": ["documentation", "api-docs", "user-manual"]
  },
  "performance": {
    "name": "Performance Optimized",
    "description": "Fast responses for simple tasks",
    "model": "qwen3:8b",
    "baseUrl": "http://localhost:11434",
    "timeout": 30000,
    "maxTokens": 2048,
    "temperature": 0.1,
    "specializations": ["performance", "optimization", "analysis"]
  }
}
```

## Testing Customizations

### Custom Test Framework

```typescript
// src/test/custom-ai-test.ts
import test from 'ava';
import { EnhancedTaskAIManager } from '../lib/task-content/enhanced-ai-manager.js';
import { MultiModelTaskAIManager } from '../lib/task-content/multi-model-ai-manager.js';
import { AIConfigLoader } from '../lib/task-content/config-loader.js';

const configLoader = new AIConfigLoader('./test-configs.json');

test('Enhanced AI Manager - Security Analysis', async (t) => {
  const aiManager = new EnhancedTaskAIManager({
    model: 'qwen3:test',
    timeout: 10000,
  });

  const result = await aiManager.analyzeTask({
    uuid: 'security-test',
    analysisType: 'security',
  });

  t.true(result.success);
  t.true(typeof result.analysis.securityScore === 'number');
  t.true(Array.isArray(result.analysis.securityIssues));
});

test('Multi-Model AI Manager - Model Selection', async (t) => {
  const aiManager = new MultiModelTaskAIManager({
    model: 'qwen3:8b',
    openai: { apiKey: process.env.OPENAI_API_KEY },
  });

  // Test security analysis uses OpenAI
  const securityResult = await aiManager.analyzeTask({
    uuid: 'test-1',
    analysisType: 'security',
  });

  // Test quality analysis uses Ollama
  const qualityResult = await aiManager.analyzeTask({
    uuid: 'test-2',
    analysisType: 'quality',
  });

  t.true(securityResult.success);
  t.true(qualityResult.success);
});

test('Custom Breakdown - Security Tasks', async (t) => {
  const aiManager = new EnhancedTaskAIManager();

  const result = await aiManager.breakdownTask({
    uuid: 'test-task',
    breakdownType: 'security-tasks',
    maxSubtasks: 4,
    complexity: 'medium',
    includeEstimates: true,
  });

  t.true(result.success);
  t.true(result.subtasks.length > 0);

  // Check for security-specific subtasks
  const hasSecurityTasks = result.subtasks.some(
    (subtask) =>
      subtask.title.toLowerCase().includes('security') ||
      subtask.title.toLowerCase().includes('authentication'),
  );
  t.true(hasSecurityTasks);
});

test('Configuration Profiles', async (t) => {
  const securityProfile = configLoader.getProfile('security');
  const docProfile = configLoader.getProfile('documentation');

  t.truthy(securityProfile);
  t.truthy(docProfile);
  t.is(securityProfile?.model, 'gpt-4');
  t.true(securityProfile?.specializations?.includes('security'));

  // Test profile selection
  const bestForSecurity = configLoader.getBestProfileForTask('analysis', 'security');
  t.is(bestForSecurity?.name, 'Security Specialist');
});
```

This customization guide provides comprehensive patterns for extending the AI system to meet specific domain requirements and organizational needs.
