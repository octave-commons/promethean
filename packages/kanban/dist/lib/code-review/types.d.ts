/**
 * Automated Code Review System for Kanban Transitions
 *
 * Provides comprehensive code analysis and review automation
 * integrated with kanban workflow transitions.
 */
import type { Task } from '../types.js';
export type { Task };
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
    score: number;
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
    transitions: string[];
    filePatterns?: string[];
    exceptions?: string[];
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
            minScore: number;
            maxViolations: number;
            maxErrors: number;
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
            tools: string[];
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
        ttl: number;
        maxSize: number;
    };
}
export interface TransitionCodeReviewConfig {
    enabled: boolean;
    required: boolean;
    rules: string[];
    thresholds: {
        minScore?: number;
        maxViolations?: number;
        maxErrors?: number;
    };
    customChecks?: string[];
}
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
    severity: number;
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
export interface ReviewCacheEntry {
    key: string;
    result: CodeReviewResult;
    timestamp: number;
    fileHashes: Record<string, string>;
    context: CodeReviewContext;
}
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
//# sourceMappingURL=types.d.ts.map