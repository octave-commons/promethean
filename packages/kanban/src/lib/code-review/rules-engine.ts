/**
 * Code Review Rules Engine
 *
 * Core engine for evaluating code review rules and managing
 * the automated code review process for kanban transitions.
 */

import { readFile, access, stat } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import path from 'path';
import type {
  CodeReviewConfig,
  CodeReviewRule,
  CodeReviewRequest,
  CodeReviewResult,
  CodeReviewViolation,
  CodeReviewSuggestion,
  CodeReviewMetrics,
  ActionItem,
  ReviewCacheEntry,
  CodeReviewContext,
  TransitionCodeReviewConfig,
  KanbanTransitionReviewRequest,
  KanbanTransitionReviewResult,
  Task,
} from './types.js';
import { ESLintAnalyzer } from './analyzers/eslint-analyzer.js';
import { TypeScriptAnalyzer } from './analyzers/typescript-analyzer.js';
import { SecurityAnalyzer } from './analyzers/security-analyzer.js';
import { AIAnalyzer } from './analyzers/ai-analyzer.js';
import { ReviewCache } from './cache/review-cache.js';

const execAsync = promisify(exec);

/**
 * Main Code Review Rules Engine
 */
export class CodeReviewRulesEngine {
  private config: CodeReviewConfig;
  private cache: ReviewCache;
  private eslintAnalyzer: ESLintAnalyzer;
  private typescriptAnalyzer: TypeScriptAnalyzer;
  private securityAnalyzer: SecurityAnalyzer;
  private aiAnalyzer: AIAnalyzer;

  constructor(config?: CodeReviewConfig) {
    this.config = config || this.getDefaultConfig();
    this.cache = new ReviewCache(this.config.caching);

    // Initialize analyzers
    this.eslintAnalyzer = new ESLintAnalyzer(this.config.tools.eslint);
    this.typescriptAnalyzer = new TypeScriptAnalyzer(this.config.tools.typescript);
    this.securityAnalyzer = new SecurityAnalyzer(this.config.tools.security);
    this.aiAnalyzer = new AIAnalyzer(this.config.tools.ai);
  }

  /**
   * Initialize the rules engine and check dependencies
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Code Review Rules Engine...');

    // Check if required tools are available
    if (this.config.tools.eslint.enabled) {
      try {
        await this.eslintAnalyzer.checkAvailability();
        console.log('✅ ESLint analyzer available');
      } catch (error) {
        console.warn('⚠️ ESLint not available:', error);
        this.config.tools.eslint.enabled = false;
      }
    }

    if (this.config.tools.typescript.enabled) {
      try {
        await this.typescriptAnalyzer.checkAvailability();
        console.log('✅ TypeScript analyzer available');
      } catch (error) {
        console.warn('⚠️ TypeScript not available:', error);
        this.config.tools.typescript.enabled = false;
      }
    }

    if (this.config.tools.security.enabled) {
      try {
        await this.securityAnalyzer.checkAvailability();
        console.log('✅ Security analyzer available');
      } catch (error) {
        console.warn('⚠️ Security tools not available:', error);
        this.config.tools.security.enabled = false;
      }
    }

    if (this.config.tools.ai.enabled) {
      try {
        await this.aiAnalyzer.checkAvailability();
        console.log('✅ AI analyzer available');
      } catch (error) {
        console.warn('⚠️ AI analyzer not available:', error);
        this.config.tools.ai.enabled = false;
      }
    }

    console.log('🎯 Code Review Rules Engine initialized');
  }

  /**
   * Validate a kanban transition with code review
   */
  async validateTransition(
    request: KanbanTransitionReviewRequest,
  ): Promise<KanbanTransitionReviewResult> {
    const { task, fromStatus, toStatus, board, changedFiles, actor } = request;

    // Skip if code review is disabled
    if (!this.config.enabled || this.config.enforcement === 'disabled') {
      return {
        allowed: true,
        reason: 'Code review is disabled',
        suggestions: [],
        warnings: [],
      };
    }

    // Get transition-specific configuration
    const transitionKey = `${fromStatus}->${toStatus}`;
    const transitionConfig = this.config.transitions[transitionKey];

    // Skip if code review is not required for this transition
    if (!transitionConfig || !transitionConfig.enabled) {
      return {
        allowed: true,
        reason: `Code review not required for ${transitionKey} transition`,
        suggestions: [],
        warnings: [],
      };
    }

    try {
      // Perform code review
      const reviewResult = await this.performCodeReview({
        task,
        changedFiles: changedFiles || (await this.getChangedFiles(task)),
        affectedPackages: await this.getAffectedPackages(task),
        reviewType: 'transition',
        context: {
          fromStatus,
          toStatus,
          board,
          transitionType: transitionKey,
          actor,
          timestamp: new Date().toISOString(),
        },
      });

      // Check if transition meets thresholds
      const allowed = this.meetsTransitionThresholds(reviewResult, transitionConfig);

      const reason = allowed
        ? `Code review passed for ${transitionKey} transition (score: ${reviewResult.score})`
        : `Code review blocked ${transitionKey} transition: ${reviewResult.summary}`;

      return {
        allowed,
        reviewResult,
        reason,
        suggestions: reviewResult.suggestions.map((s) => s.message),
        warnings: reviewResult.violations
          .filter((v) => v.severity === 'warning')
          .map((v) => v.message),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (this.config.enforcement === 'strict') {
        return {
          allowed: false,
          reason: `Code review failed: ${errorMessage}`,
          suggestions: [],
          warnings: [],
        };
      } else {
        return {
          allowed: true,
          reason: `Code review failed but proceeding in warn mode: ${errorMessage}`,
          suggestions: [],
          warnings: [`Code review error: ${errorMessage}`],
        };
}
        }
      }
    } catch (error) {
      console.warn('TypeScript analysis failed:', error);
    }
  }

  /**
   * Perform comprehensive code review
   */
  async performCodeReview(request: CodeReviewRequest): Promise<CodeReviewResult> {
    const { task, changedFiles, affectedPackages, reviewType, context } = request;

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached, request)) {
      console.log(`📋 Using cached code review result for task ${task.uuid}`);
      return cached.result;
    }

    console.log(
      `🔍 Performing code review for task ${task.uuid} (${context.fromStatus}->${context.toStatus})`,
    );

    const violations: CodeReviewViolation[] = [];
    const suggestions: CodeReviewSuggestion[] = [];
    const actionItems: ActionItem[] = [];

    // Get applicable rules for this transition
    const transitionKey = `${context.fromStatus}->${context.toStatus}`;
    const transitionConfig = this.config.transitions[transitionKey];
    const applicableRules = this.getApplicableRules(transitionConfig);

    // Run analyzers based on enabled rules
    const analysisPromises: Promise<void>[] = [];

    if (this.hasRulesOfType(applicableRules, 'eslint')) {
      analysisPromises.push(
        this.runESLintAnalysis(changedFiles, applicableRules, violations, suggestions, actionItems),
      );
    }

    if (this.hasRulesOfType(applicableRules, 'typescript')) {
      analysisPromises.push(
        this.runTypeScriptAnalysis(
          changedFiles,
          applicableRules,
          violations,
          suggestions,
          actionItems,
        ),
      );
    }

    if (this.hasRulesOfType(applicableRules, 'security')) {
      analysisPromises.push(
        this.runSecurityAnalysis(
          changedFiles,
          applicableRules,
          violations,
          suggestions,
          actionItems,
        ),
      );
    }

    if (this.hasRulesOfType(applicableRules, 'ai')) {
      analysisPromises.push(
        this.runAIAnalysis(
          task,
          changedFiles,
          applicableRules,
          violations,
          suggestions,
          actionItems,
        ),
      );
    }

    // Wait for all analyses to complete
    await Promise.all(analysisPromises);

    // Calculate metrics and score
    const metrics = this.calculateMetrics(violations);
    const score = this.calculateScore(metrics, violations.length);

    // Generate summary
    const summary = this.generateSummary(metrics, score, context);

    // Determine if blocked
    const blocked = this.isBlocked(score, violations, context);

    const result: CodeReviewResult = {
      success: !blocked,
      score,
      violations,
      suggestions,
      metrics,
      summary,
      actionItems,
      blocked,
    };

    // Cache the result
    await this.cache.set(cacheKey, {
      key: cacheKey,
      result,
      timestamp: Date.now(),
      fileHashes: await this.getFileHashes(changedFiles),
      context,
    });

    console.log(
      `✅ Code review completed for task ${task.uuid}: score=${score}, violations=${violations.length}`,
    );

    return result;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): CodeReviewConfig {
    return {
      enabled: true,
      enforcement: 'strict',
      transitions: {
        'in_progress->testing': {
          enabled: true,
          required: true,
          rules: ['eslint', 'typescript', 'security'],
          thresholds: {
            minScore: 75,
            maxViolations: 15,
            maxErrors: 0,
          },
        },
        'testing->review': {
          enabled: true,
          required: true,
          rules: ['eslint', 'typescript', 'security', 'ai'],
          thresholds: {
            minScore: 85,
            maxViolations: 10,
            maxErrors: 0,
          },
        },
        'review->document': {
          enabled: true,
          required: false,
          rules: ['eslint', 'typescript'],
          thresholds: {
            minScore: 80,
            maxViolations: 5,
            maxErrors: 0,
          },
        },
      },
      rules: this.getDefaultRules(),
      thresholds: {
        overall: {
          minScore: 80,
          maxViolations: 10,
          maxErrors: 0,
        },
        byCategory: {
          security: {
            maxErrors: 0,
            maxViolations: 0,
          },
          performance: {
            maxErrors: 0,
            maxViolations: 5,
          },
          maintainability: {
            maxErrors: 2,
            maxViolations: 10,
          },
        },
      },
      tools: {
        eslint: {
          enabled: true,
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          timeout: 30000,
        },
        typescript: {
          enabled: true,
          strict: true,
          timeout: 30000,
        },
        security: {
          enabled: true,
          tools: ['semgrep'],
          timeout: 60000,
        },
        ai: {
          enabled: true,
          model: 'qwen3:8b',
          temperature: 0.2,
          maxTokens: 2000,
          timeout: 45000,
        },
      },
      reporting: {
        includeDetails: true,
        generateActionItems: true,
        appendToTask: true,
        createSeparateReport: false,
      },
      caching: {
        enabled: true,
        ttl: 300, // 5 minutes
        maxSize: 100,
      },
    };
  }

  /**
   * Get default rules
   */
  private getDefaultRules(): CodeReviewRule[] {
    return [
      {
        id: 'eslint-errors',
        name: 'ESLint Error Rules',
        description: 'ESLint rules that produce errors',
        enabled: true,
        category: 'style',
        severity: 'error',
        tool: 'eslint',
        config: { ruleType: 'error' },
        transitions: ['in_progress->testing', 'testing->review'],
        filePatterns: ['**/*.{ts,tsx,js,jsx}'],
      },
      {
        id: 'typescript-strict',
        name: 'TypeScript Strict Mode',
        description: 'TypeScript strict type checking',
        enabled: true,
        category: 'maintainability',
        severity: 'error',
        tool: 'typescript',
        config: { strict: true },
        transitions: ['in_progress->testing', 'testing->review'],
        filePatterns: ['**/*.{ts,tsx}'],
      },
      {
        id: 'security-scan',
        name: 'Security Vulnerability Scan',
        description: 'Security vulnerability detection',
        enabled: true,
        category: 'security',
        severity: 'error',
        tool: 'security',
        config: { tools: ['semgrep'] },
        transitions: ['in_progress->testing', 'testing->review'],
        filePatterns: ['**/*.{ts,tsx,js,jsx}'],
      },
      {
        id: 'ai-quality',
        name: 'AI Code Quality Analysis',
        description: 'AI-powered code quality assessment',
        enabled: true,
        category: 'maintainability',
        severity: 'warning',
        tool: 'ai',
        config: { analysisType: 'quality' },
        transitions: ['testing->review'],
        filePatterns: ['**/*.{ts,tsx,js,jsx}'],
      },
    ];
  }

  /**
   * Helper methods
   */
  private async getChangedFiles(task: Task): Promise<string[]> {
    // Extract changed files from task content or git diff
    const content = task.content || '';
    const fileMatch = content.match(/changed[_-]?files[:\s]+([^\n]+)/i);
    if (fileMatch) {
      return fileMatch[1]
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    }

    // Fallback: get git diff for recent commits
    try {
      const { stdout } = await execAsync('git diff --name-only HEAD~1 HEAD', { timeout: 10000 });
      return stdout
        .trim()
        .split('\n')
        .filter((f) => f.length > 0);
    } catch {
      return [];
    }
  }

  private async getAffectedPackages(task: Task): Promise<string[]> {
    const content = task.content || '';
    const packageMatch = content.match(/affected[_-]?packages[:\s]+([^\n]+)/i);
    if (packageMatch) {
      return packageMatch[1]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }
    return [];
  }

  private generateCacheKey(request: CodeReviewRequest): string {
    const { task, changedFiles, context } = request;
    const keyData = {
      taskUuid: task.uuid,
      files: changedFiles.sort(),
      transition: `${context.fromStatus}->${context.toStatus}`,
      timestamp: context.timestamp,
    };
    return createHash('md5').update(JSON.stringify(keyData)).digest('hex');
  }

  private async isCacheValid(
    entry: ReviewCacheEntry,
    request: CodeReviewRequest,
  ): Promise<boolean> {
    const age = Date.now() - entry.timestamp;
    if (age > this.config.caching.ttl * 1000) {
      return false;
    }

    // Check if files have changed
    const currentHashes = await this.getFileHashes(request.changedFiles);
    return JSON.stringify(currentHashes) === JSON.stringify(entry.fileHashes);
  }

  private async getFileHashes(files: string[]): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {};
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        hashes[file] = createHash('md5').update(content).digest('hex');
      } catch {
        hashes[file] = 'not-found';
      }
    }
    return hashes;
  }

  private getApplicableRules(transitionConfig?: TransitionCodeReviewConfig): CodeReviewRule[] {
    if (!transitionConfig) return [];

    return this.config.rules.filter(
      (rule) => transitionConfig.rules.includes(rule.id) && rule.enabled,
    );
  }

  private hasRulesOfType(rules: CodeReviewRule[], tool: string): boolean {
    return rules.some((rule) => rule.tool === tool);
  }

  private async runESLintAnalysis(
    files: string[],
    rules: CodeReviewRule[],
    violations: CodeReviewViolation[],
    suggestions: CodeReviewSuggestion[],
    actionItems: ActionItem[],
  ): Promise<void> {
    try {
      const results = await this.eslintAnalyzer.analyze(files);

      for (const result of results) {
        for (const message of result.messages) {
          const violation: CodeReviewViolation = {
            id: `eslint-${message.ruleId}`,
            severity: message.severity === 2 ? 'error' : 'warning',
            category: 'style',
            rule: message.ruleId || 'unknown',
            message: message.message,
            file: result.filePath,
            line: message.line,
            column: message.column,
            source: 'eslint',
            fixable: message.fix !== undefined,
            autoFixAvailable: message.fix !== undefined,
          };
          violations.push(violation);

          if (violation.fixable) {
            actionItems.push({
              type: 'fix',
              description: `Fix ESLint violation: ${message.message}`,
              priority: violation.severity === 'error' ? 'high' : 'medium',
              estimatedEffort: 'low',
              file: result.filePath,
              automated: true,
            });
          }
        }
      }
    } catch (error) {
      console.warn('ESLint analysis failed:', error);
    }
  }

  private async runTypeScriptAnalysis(
    files: string[],
    rules: CodeReviewRule[],
    violations: CodeReviewViolation[],
    suggestions: CodeReviewSuggestion[],
    actionItems: ActionItem[],
  ): Promise<void> {
    try {
      const results = await this.typescriptAnalyzer.analyze(files);

      for (const result of results) {
        for (const diagnostic of result.diagnostics) {
        const violation: CodeReviewViolation = {
          id: `ts-${diagnostic.code}`,
          severity: diagnostic.category === 1 ? 'error' : 'warning',
          category: 'maintainability',
          rule: `TypeScript ${diagnostic.code}`,
          message: diagnostic.messageText.toString(),
          file: diagnostic.file,
          line: diagnostic.start,
          source: 'typescript',
          fixable: false,
          autoFixAvailable: false,
        };
        violations.push(violation);
      }
    } catch (error) {
      console.warn('TypeScript analysis failed:', error);
    }
  }

  private async runSecurityAnalysis(
    files: string[],
    rules: CodeReviewRule[],
    violations: CodeReviewViolation[],
    suggestions: CodeReviewSuggestion[],
    actionItems: ActionItem[],
  ): Promise<void> {
    try {
      const result = await this.securityAnalyzer.analyze(files);

      for (const finding of result.findings) {
        const violation: CodeReviewViolation = {
          id: `security-${finding.id}`,
          severity:
            finding.severity === 'critical' || finding.severity === 'high' ? 'error' : 'warning',
          category: 'security',
          rule: finding.ruleId,
          message: finding.message,
          file: finding.file,
          line: finding.line,
          source: 'security',
          fixable: false,
          autoFixAvailable: false,
        };
        violations.push(violation);

        actionItems.push({
          type: 'fix',
          description: `Fix security issue: ${finding.message}`,
          priority: 'high',
          estimatedEffort: 'medium',
          file: finding.file,
          automated: false,
        });
      }
    } catch (error) {
      console.warn('Security analysis failed:', error);
    }
  }

  private async runAIAnalysis(
    task: Task,
    files: string[],
    rules: CodeReviewRule[],
    violations: CodeReviewViolation[],
    suggestions: CodeReviewSuggestion[],
    actionItems: ActionItem[],
  ): Promise<void> {
    try {
      const result = await this.aiAnalyzer.analyze(task, files);

      // Convert AI suggestions to code review suggestions
      for (const suggestion of result.suggestions) {
        suggestions.push({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: suggestion.type,
          category: suggestion.category,
          message: suggestion.message,
          file: suggestion.file,
          line: suggestion.line,
          impact: suggestion.impact,
          effort: suggestion.effort,
          example: suggestion.example,
        });
      }

      // Add AI insights as suggestions
      for (const insight of result.insights) {
        suggestions.push({
          id: `ai-insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'improvement',
          category: 'ai-insight',
          message: insight,
          impact: 'medium',
          effort: 'low',
        });
      }
    } catch (error) {
      console.warn('AI analysis failed:', error);
    }
  }

  private calculateMetrics(violations: CodeReviewViolation[]): CodeReviewMetrics {
    const errors = violations.filter((v) => v.severity === 'error').length;
    const warnings = violations.filter((v) => v.severity === 'warning').length;
    const info = violations.filter((v) => v.severity === 'info').length;
    const fixable = violations.filter((v) => v.fixable).length;

    return {
      totalViolations: violations.length,
      errors,
      warnings,
      info,
      fixableViolations: fixable,
    };
  }

  private calculateScore(metrics: CodeReviewMetrics, totalViolations: number): number {
    // Base score starts at 100
    let score = 100;

    // Deduct points for violations
    score -= metrics.errors * 10; // -10 points per error
    score -= metrics.warnings * 3; // -3 points per warning
    score -= metrics.info * 1; // -1 point per info

    // Bonus for fixable violations
    score += metrics.fixableViolations * 2; // +2 points per fixable violation

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  private generateSummary(
    metrics: CodeReviewMetrics,
    score: number,
    context: CodeReviewContext,
  ): string {
    const status = score >= 80 ? '✅ Excellent' : score >= 60 ? '⚠️ Needs Improvement' : '❌ Poor';
    return `${status} code quality for ${context.transitionType} transition. Score: ${score}/100, Violations: ${metrics.totalViolations} (${metrics.errors} errors, ${metrics.warnings} warnings)`;
  }

  private isBlocked(
    score: number,
    violations: CodeReviewViolation[],
    context: CodeReviewContext,
  ): boolean {
    const transitionKey = `${context.fromStatus}->${context.toStatus}`;
    const transitionConfig = this.config.transitions[transitionKey];

    if (!transitionConfig) return false;

    // Check thresholds
    if (transitionConfig.thresholds.minScore && score < transitionConfig.thresholds.minScore) {
      return true;
    }

    if (
      transitionConfig.thresholds.maxErrors &&
      violations.filter((v) => v.severity === 'error').length >
        transitionConfig.thresholds.maxErrors
    ) {
      return true;
    }

    if (
      transitionConfig.thresholds.maxViolations &&
      violations.length > transitionConfig.thresholds.maxViolations
    ) {
      return true;
    }

    // Always block on security errors
    if (violations.some((v) => v.category === 'security' && v.severity === 'error')) {
      return true;
    }

    return false;
  }

  private meetsTransitionThresholds(
    result: CodeReviewResult,
    transitionConfig: TransitionCodeReviewConfig,
  ): boolean {
    if (
      transitionConfig.thresholds.minScore &&
      result.score < transitionConfig.thresholds.minScore
    ) {
      return false;
    }

    if (
      transitionConfig.thresholds.maxErrors &&
      result.metrics.errors > transitionConfig.thresholds.maxErrors
    ) {
      return false;
    }

    if (
      transitionConfig.thresholds.maxViolations &&
      result.metrics.totalViolations > transitionConfig.thresholds.maxViolations
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Create and configure a code review rules engine
 */
export async function createCodeReviewRulesEngine(
  configPath?: string,
): Promise<CodeReviewRulesEngine> {
  let config: CodeReviewConfig;

  if (configPath) {
    try {
      const configContent = await readFile(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error) {
      console.warn(`Failed to load code review config from ${configPath}:`, error);
      config = new CodeReviewRulesEngine().getDefaultConfig();
    }
  } else {
    config = new CodeReviewRulesEngine().getDefaultConfig();
  }

  const engine = new CodeReviewRulesEngine(config);
  await engine.initialize();

  return engine;
}
