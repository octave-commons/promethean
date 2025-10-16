/**
 * Automated Code Review System for Kanban Transitions
 *
 * Provides comprehensive code analysis and review automation
 * integrated with kanban workflow transitions.
 */

// Re-export Task type from main kanban types
export interface Task {
  uuid: string;
  title: string;
  content?: string;
  status: string;
  priority?: string;
  tags?: string[];
  frontmatter?: Record<string, any>;
  [key: string]: any;
}

// === Core Code Review Interfaces ===

export interface CodeReviewRequest {
  task: Task;
  changedFiles: string[];
  affectedPackages: string[];
  reviewType: 'transition' | 'pull_request' | 'commit' | 'comprehensive';
  context: CodeReviewContext;
}

export interface CodeReviewContext {
  fromStatus: string;
  toStatus: string;
  board?: any;
  transitionType: string;
  actor: 'agent' | 'human' | 'system';
  timestamp: string;
}

export interface CodeReviewResult {
  success: boolean;
  score: number; // 0-100 overall review score
  violations: CodeReviewViolation[];
  suggestions: CodeReviewSuggestion[];
  metrics: CodeReviewMetrics;
  summary: string;
  actionItems: ActionItem[];
  blocked: boolean;
  retryCount?: number;
}

export interface CodeReviewViolation {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'security' | 'performance' | 'maintainability' | 'style' | 'testing' | 'documentation';
  rule: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  source: 'eslint' | 'typescript' | 'security' | 'custom' | 'ai';
  fixable: boolean;
  autoFixAvailable: boolean;
}

export interface CodeReviewSuggestion {
  id: string;
  type: 'improvement' | 'optimization' | 'refactor' | 'best_practice';
  category: string;
  message: string;
  file?: string;
  line?: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  example?: string;
}

export interface CodeReviewMetrics {
  totalViolations: number;
  errors: number;
  warnings: number;
  info: number;
  fixableViolations: number;
  coverage?: number;
  complexity?: number;
  maintainabilityIndex?: number;
  technicalDebt?: number;
  duplicatedLines?: number;
}

export interface ActionItem {
  type: 'fix' | 'review' | 'test' | 'document' | 'refactor';
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: string;
  file?: string;
  automated: boolean;
}

// === Rule Configuration Interfaces ===

export interface CodeReviewRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'security' | 'performance' | 'maintainability' | 'style' | 'testing' | 'documentation';
  severity: 'error' | 'warning' | 'info';
  tool: 'eslint' | 'typescript' | 'security' | 'custom' | 'ai';
  config: Record<string, any>;
  thresholds?: {
    max?: number;
    min?: number;
    target?: number;
  };
  transitions: string[]; // Which transitions this rule applies to
  filePatterns?: string[]; // Glob patterns for files this rule applies to
  exceptions?: string[]; // File patterns to exclude
}

export interface CodeReviewConfig {
  enabled: boolean;
  enforcement: 'strict' | 'warn' | 'disabled';
  transitions: {
    [transitionName: string]: TransitionCodeReviewConfig;
  };
  rules: CodeReviewRule[];
  thresholds: {
    overall: {
      minScore: number; // default: 80
      maxViolations: number; // default: 10
      maxErrors: number; // default: 0
    };
    byCategory: {
      [category: string]: {
        maxViolations?: number;
        maxErrors?: number;
        minScore?: number;
      };
    };
  };
  tools: {
    eslint: {
      enabled: boolean;
      configPath?: string;
      extensions: string[];
      timeout: number;
    };
    typescript: {
      enabled: boolean;
      configPath?: string;
      strict: boolean;
      timeout: number;
    };
    security: {
      enabled: boolean;
      tools: string[]; // semgrep, snyk, etc.
      timeout: number;
    };
    ai: {
      enabled: boolean;
      model: string;
      temperature: number;
      maxTokens: number;
      timeout: number;
    };
  };
  reporting: {
    includeDetails: boolean;
    generateActionItems: boolean;
    appendToTask: boolean;
    createSeparateReport: boolean;
    reportPath?: string;
  };
  caching: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
    maxSize: number; // Max cache size
  };
}

export interface TransitionCodeReviewConfig {
  enabled: boolean;
  required: boolean; // Whether review is required for this transition
  rules: string[]; // Rule IDs to apply
  thresholds: {
    minScore?: number;
    maxViolations?: number;
    maxErrors?: number;
  };
  customChecks?: string[]; // Custom check names
}

// === Analysis Tool Interfaces ===

export interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

export interface ESLintMessage {
  ruleId: string | null;
  severity: number; // 1 = warning, 2 = error
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId?: string;
  endLine?: number;
  endColumn?: number;
  fix?: {
    range: [number, number];
    text: string;
  };
}

export interface TypeScriptResult {
  filePath: string;
  diagnostics: TypeScriptDiagnostic[];
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
}

export interface TypeScriptDiagnostic {
  category: number;
  code: number;
  file: string;
  start: number;
  length: number;
  messageText: string;
  categoryText: string;
  relatedInformation?: TypeScriptRelatedInformation[];
}

export interface TypeScriptRelatedInformation {
  category: number;
  code: number;
  file: string;
  start: number;
  length: number;
  messageText: string;
  categoryText: string;
}

export interface SecurityResult {
  tool: string;
  findings: SecurityFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface SecurityFinding {
  id: string;
  ruleId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: 'high' | 'medium' | 'low';
  message: string;
  file: string;
  line?: number;
  endLine?: number;
  column?: number;
  endColumn?: number;
  cwe?: string;
  owasp?: string;
  references?: string[];
}

export interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  codeQuality: {
    readability: number;
    maintainability: number;
    testability: number;
    documentation: number;
  };
  suggestions: CodeReviewSuggestion[];
  confidence: number;
}

// === Caching Interfaces ===

export interface ReviewCacheEntry {
  key: string;
  result: CodeReviewResult;
  timestamp: number;
  fileHashes: Record<string, string>;
  context: CodeReviewContext;
}

// === Integration Interfaces ===

export interface KanbanTransitionReviewRequest {
  task: Task;
  fromStatus: string;
  toStatus: string;
  board?: any;
  changedFiles?: string[];
  actor: 'agent' | 'human' | 'system';
}

export interface KanbanTransitionReviewResult {
  allowed: boolean;
  reviewResult?: CodeReviewResult;
  reason: string;
  suggestions: string[];
  warnings: string[];
}

// === Workflow Integration ===

export interface AgentWorkflowReviewStep {
  id: string;
  name: string;
  description: string;
  tool: string;
  config: Record<string, any>;
  dependencies: string[];
  onFailure: 'block' | 'warn' | 'continue';
}

export interface ReviewWorkflow {
  id: string;
  name: string;
  description: string;
  steps: AgentWorkflowReviewStep[];
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
}