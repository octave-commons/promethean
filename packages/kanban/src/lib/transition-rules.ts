/**
 * Kanban Transition Rules Engine
 *
 * Enforces kanban board transition rules using a combination of:
 * - JSON configuration rules
 * - Clojure NBB DSL for custom logic
 * - Built-in JavaScript rule validators
 * - Testing→review transition validation with coverage and quality gates
 */

import { readFile, access } from 'fs/promises';
import type { Task, Board } from './types.js';
import { runTestingTransition } from './testing-transition/index.js';
import type { TestingTransitionConfig, TestCoverageRequest } from './testing-transition/types.js';

export interface TransitionRule {
  from: string[];
  to: string[];
  description: string;
  check: string;
}

export interface CustomCheck {
  description: string;
  impl: string;
}

export interface GlobalRule {
  name: string;
  description: string;
  enabled: boolean;
  impl: string;
}

export interface TransitionRulesConfig {
  enabled: boolean;
  enforcement: 'strict' | 'warn' | 'disabled';
  dslPath?: string;
  rules: TransitionRule[];
  customChecks: Record<string, CustomCheck>;
  globalRules: GlobalRule[];
}

export interface TransitionResult {
  allowed: boolean;
  reason: string;
  ruleViolations: string[];
  suggestions: string[];
  suggestedAlternatives: string[];
  warnings: string[];
}

export interface TransitionDebug {
  from: string;
  to: string;
  task: Task;
  wipCheck: boolean;
  existenceCheck: boolean;
  validTransitions: string[];
}

/**
 * Transition Rules Engine
 *
 * Validates kanban board state transitions according to configured rules
 * and custom logic defined in Clojure DSL.
 */
export class TransitionRulesEngine {
  private config: TransitionRulesConfig;
  private dslAvailable: boolean = false;
  private testingConfig: TestingTransitionConfig;

  constructor(config?: TransitionRulesConfig) {
    // Default configuration if none provided
    this.config = config || {
      enabled: true,
      enforcement: 'strict',
      dslPath: '',
      rules: [],
      customChecks: {},
      globalRules: [],
    };

    // Default testing transition configuration
    this.testingConfig = {
      enabled: true,
      thresholds: {
        coverage: 90,
        quality: 75,
        softBlock: 90,
        hardBlock: 75,
      },
      weights: {
        coverage: 0.4,
        quality: 0.3,
        requirementMapping: 0.2,
        contextualAnalysis: 0.1,
      },
      timeouts: {
        coverageAnalysis: 10000,
        qualityAssessment: 15000,
        requirementMapping: 20000,
        totalAnalysis: 60000,
      },
      reporting: {
        includeDetailedRationale: true,
        generateActionItems: true,
        appendToTask: true,
      },
    };
  }

  /**
   * Initialize the rules engine and check if Clojure DSL is available
   */
  async initialize(): Promise<void> {
    if (!this.config.dslPath) {
      throw new Error(
        'Clojure DSL path is required. TypeScript transition rules are no longer supported.',
      );
    }

    try {
      await access(this.config.dslPath);
      this.dslAvailable = true;
      console.log(`🔧 Clojure DSL available: ${this.config.dslPath}`);
    } catch {
      throw new Error(
        `Clojure DSL not found at: ${this.config.dslPath}. Transition rules cannot function without the Clojure DSL.`,
      );
    }
  }

  /**
   * Check if a transition from one status to another is allowed
   */
  async validateTransition(
    from: string,
    to: string,
    task: Task,
    board: Board,
  ): Promise<TransitionResult> {
    // Skip validation if rules are disabled
    if (!this.config.enabled || this.config.enforcement === 'disabled') {
      return {
        allowed: true,
        reason: 'Transition rules are disabled',
        ruleViolations: [],
        suggestions: [],
        suggestedAlternatives: [],
        warnings: [],
      };
    }

    const violations: string[] = [];
    const suggestions: string[] = [];

    // Normalize column names
    const fromNormalized = this.normalizeColumnName(from);
    const toNormalized = this.normalizeColumnName(to);

    // Check 1: Is this a defined transition?
    const transitionRule = this.findTransitionRule(fromNormalized, toNormalized);
    if (!transitionRule) {
      // Check if this is a backward transition
      if (this.isBackwardTransition(fromNormalized, toNormalized)) {
        console.log(`✅ Backward transition allowed: ${fromNormalized} → ${toNormalized}`);
      } else {
        violations.push(
          `Invalid transition: ${fromNormalized} → ${toNormalized} is not a defined transition`,
        );

        const validTargets = this.getValidTransitions(fromNormalized);
        if (validTargets.length > 0) {
          suggestions.push(`Valid transitions from ${fromNormalized}: ${validTargets.join(', ')}`);
        }
      }
    }

    // Check 2: Global rules (WIP limits, task existence, etc.)
    for (const globalRule of this.config.globalRules) {
      if (!globalRule.enabled) continue;

      try {
        const passes = await this.evaluateGlobalRule(
          globalRule,
          fromNormalized,
          toNormalized,
          task,
          board,
        );
        if (!passes) {
          violations.push(`Global rule violation: ${globalRule.description}`);
        }
      } catch (error) {
        console.warn(`Failed to evaluate global rule ${globalRule.name}:`, error);
      }
    }

    // Check 3: Testing→review specific validation
    if (fromNormalized === 'testing' && toNormalized === 'review') {
      try {
        const testingResult = await this.validateTestingToReviewTransition(task, board);
        if (!testingResult.allowed) {
          violations.push(...testingResult.violations);
        }
      } catch (error) {
        console.warn(`Failed to validate testing→review transition:`, error);
        violations.push(
          `Testing transition validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Check 4: Custom transition-specific rules
    if (transitionRule && transitionRule.check) {
      try {
        const passes = await this.evaluateCustomCheck(transitionRule.check, task, board);
        if (!passes) {
          violations.push(`Transition check failed: ${transitionRule.description}`);
        }
      } catch (error) {
        console.warn(`Failed to evaluate transition check ${transitionRule.check}:`, error);
      }
    }

    const allowed = violations.length === 0;
    const reason = allowed
      ? `Transition ${fromNormalized} → ${toNormalized} is allowed`
      : `Transition blocked: ${violations.join('; ')}`;

    return {
      allowed,
      reason,
      ruleViolations: violations,
      suggestions,
      suggestedAlternatives: suggestions,
      warnings: [],
    };
  }

  /**
   * Get all valid transitions from a given column
   */
  getValidTransitions(from: string): string[] {
    const fromNormalized = this.normalizeColumnName(from);

    const validRules = this.config.rules.filter((rule) => rule.from.includes(fromNormalized));

    return validRules.flatMap((rule) => rule.to);
  }

  /**
   * Debug why a transition was rejected or approved
   */
  async debugTransition(
    from: string,
    to: string,
    task: Task,
    board: Board,
  ): Promise<TransitionDebug> {
    const fromNormalized = this.normalizeColumnName(from);
    const toNormalized = this.normalizeColumnName(to);

    // Evaluate WIP check
    const wipCheck = await this.evaluateWipLimit(toNormalized, board);

    // Evaluate task existence check
    const existenceCheck = this.evaluateTaskExistence(fromNormalized, task, board);

    return {
      from: fromNormalized,
      to: toNormalized,
      task,
      wipCheck,
      existenceCheck,
      validTransitions: this.getValidTransitions(fromNormalized),
    };
  }

  /**
   * Show the current process flow as a graph
   */
  showProcessFlow(): string {
    const lines = ['🔄 Kanban Process Flow', ''];

    this.config.rules.forEach((rule) => {
      rule.from.forEach((from) => {
        rule.to.forEach((to) => {
          lines.push(`  ${from} → ${to} (${rule.description})`);
        });
      });
    });

    lines.push('');
    lines.push('📋 Valid Transitions by Column:');
    lines.push('');

    // Group by source column
    const bySource = new Map<string, Set<string>>();
    this.config.rules.forEach((rule) => {
      rule.from.forEach((from) => {
        if (!bySource.has(from)) {
          bySource.set(from, new Set());
        }
        rule.to.forEach((to) => {
          bySource.get(from)!.add(to);
        });
      });
    });

    bySource.forEach((targets, from) => {
      lines.push(`  ${from}: ${Array.from(targets).join(', ')}`);
    });

    return lines.join('\n');
  }

  /**
   * Validate testing→review transition with coverage and quality gates
   */
  private async validateTestingToReviewTransition(
    task: Task,
    _board: Board,
  ): Promise<{ allowed: boolean; violations: string[] }> {
    const violations: string[] = [];

    try {
      // Extract testing information from task content or metadata
      const testingInfo = this.extractTestingInfo(task);

      if (!testingInfo.coverageReportPath) {
        violations.push('No coverage report path specified in task');
        return { allowed: false, violations };
      }

      // Set up timeout for performance validation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Testing transition validation timeout')),
          this.testingConfig.timeouts.totalAnalysis,
        );
      });

      // Run testing transition validation with timeout
      const validationPromise = this.runTestingValidation(task, testingInfo);

      await Promise.race([validationPromise, timeoutPromise]);

      return { allowed: true, violations };
    } catch (error) {
      if (error instanceof Error) {
        violations.push(error.message);
      } else {
        violations.push('Unknown error during testing transition validation');
      }
      return { allowed: false, violations };
    }
  }

  /**
   * Extract testing information from task
   */
  private extractTestingInfo(task: Task): {
    coverageReportPath?: string;
    executedTests?: string[];
    requirementMappings?: Array<{ requirementId: string; testIds: string[] }>;
  } {
    const content = task.content || '';

    // Look for coverage report path in task content
    const coverageMatch = content.match(/coverage[_-]?report[:\s]+([^\s\n]+)/i);
    const coverageReportPath = coverageMatch ? coverageMatch[1] : undefined;

    // Look for executed tests
    const testsMatch = content.match(/executed[_-]?tests[:\s]+([^\n]+)/i);
    const executedTests = testsMatch ? testsMatch[1]?.split(',').map((t) => t.trim()) : [];

    // Look for requirement mappings
    const mappingsMatch = content.match(/requirement[_-]?mappings[:\s]+([^\n]+)/i);
    const requirementMappings = mappingsMatch
      ? (JSON.parse(mappingsMatch[1] || '[]') as Array<{
          requirementId: string;
          testIds: string[];
        }>)
      : [];

    return {
      coverageReportPath,
      executedTests,
      requirementMappings,
    };
  }

  /**
   * Run the actual testing validation
   */
  private async runTestingValidation(
    task: Task,
    testingInfo: {
      coverageReportPath?: string;
      executedTests?: string[];
      requirementMappings?: Array<{ requirementId: string; testIds: string[] }>;
    },
  ): Promise<void> {
    if (!testingInfo.coverageReportPath) {
      throw new Error('Coverage report path is required for testing→review transition');
    }

    // Determine coverage format from file extension
    const format = this.getCoverageFormat(testingInfo.coverageReportPath);
    const supportedFormats = ['lcov', 'cobertura', 'json'];
    if (!supportedFormats.includes(format)) {
      throw new Error(
        `Unsupported coverage format: ${format}. Supported formats: ${supportedFormats.join(', ')}`,
      );
    }

    // Run testing transition validation
    const coverageRequest: TestCoverageRequest = {
      task: {
        uuid: task.uuid,
        title: task.title,
        content: task.content,
        status: task.status,
        priority: typeof task.priority === 'string' ? task.priority : String(task.priority || ''),
        frontmatter: task.frontmatter,
      },
      changedFiles: [], // Will be extracted from task content
      affectedPackages: [], // Will be determined from changed files
    };

    await runTestingTransition(
      coverageRequest,
      testingInfo.executedTests || [],
      testingInfo.requirementMappings || [],
      this.testingConfig,
      [], // tests - will be extracted from task content
      `docs/agile/tasks/${task.uuid}`, // output directory for report
    );
  }

  /**
   * Determine coverage format from file path
   */
  private getCoverageFormat(filePath: string): 'lcov' | 'cobertura' | 'json' {
    if (filePath.endsWith('.lcov') || filePath.includes('lcov.info')) {
      return 'lcov';
    }
    if (filePath.endsWith('.xml') || filePath.includes('cobertura')) {
      return 'cobertura';
    }
    if (filePath.endsWith('.json')) {
      return 'json';
    }
    // Default to lcov for unknown formats
    return 'lcov';
  }

  // Private helper methods

  private normalizeColumnName(column: string): string {
    // Match the normalization used in kanban.ts columnKey function
    return column
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
      .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars
  }

  private findTransitionRule(from: string, to: string): TransitionRule | undefined {
    return this.config.rules.find((rule) => rule.from.includes(from) && rule.to.includes(to));
  }

  private isBackwardTransition(from: string, to: string): boolean {
    const workflowOrder = [
      'icebox',
      'incoming',
      'accepted',
      'breakdown',
      'ready',
      'todo',
      'in_progress',
      'testing',
      'review',
      'document',
      'done',
    ];

    const fromIndex = workflowOrder.indexOf(from);
    const toIndex = workflowOrder.indexOf(to);

    return fromIndex >= 0 && toIndex >= 0 && toIndex < fromIndex;
  }

  private async evaluateGlobalRule(
    rule: GlobalRule,
    from: string,
    to: string,
    task: Task,
    board: Board,
  ): Promise<boolean> {
    // Special handling for built-in global rules
    switch (rule.name) {
      case 'wip-limits':
        return await this.evaluateWipLimit(to, board);

      case 'task-existence':
        return this.evaluateTaskExistence(from, task, board);

      default:
        return await this.evaluateCustomRule(rule.impl, [from, to], task, board);
    }
  }

  private async evaluateWipLimit(targetColumn: string, board: Board): Promise<boolean> {
    const column = board.columns.find((col) => this.normalizeColumnName(col.name) === targetColumn);

    if (!column) return true;
    if (!column.limit) return true;

    return column.count < column.limit;
  }

  private evaluateTaskExistence(sourceColumn: string, task: Task, board: Board): boolean {
    const column = board.columns.find((col) => this.normalizeColumnName(col.name) === sourceColumn);

    if (!column) return false;

    return column.tasks.some((t) => t.uuid === task.uuid);
  }

  private async evaluateCustomCheck(checkName: string, task: Task, board: Board): Promise<boolean> {
    const check = this.config.customChecks[checkName];
    if (!check) {
      console.warn(`Custom check not found: ${checkName}`);
      return true; // Default to allowing if check is missing
    }

    return await this.evaluateCustomRule(check.impl, [], task, board);
  }

  private async evaluateCustomRule(
    ruleImpl: string,
    args: any[],
    task: Task,
    board: Board,
  ): Promise<boolean> {
    if (!this.dslAvailable) {
      throw new Error(
        'Clojure DSL is required but not available. TypeScript transition rules are no longer supported.',
      );
    }

    try {
      // Use nbb (Node.js Babashka) to evaluate Clojure expressions
      // @ts-ignore - nbb doesn't have TypeScript definitions
      const { default: nbb } = await import('nbb');

      // Load the Clojure DSL file
      const dslCode = await readFile(this.config.dslPath!, 'utf-8');
      
      // Create a safe evaluation context with DSL loaded
      const clojureCode = `
        ${dslCode}
        
        (require '[kanban-transitions :as kt])
        
        ;; Convert JavaScript objects to Clojure maps for evaluation
        (def task-clj {:uuid "${task.uuid}"
                       :title "${task.title}"
                       :priority "${task.priority}"
                       :content "${task.content || ''}"
                       :status "${task.status}"
                       :estimates {:complexity ${task.estimates?.complexity || 999}}
                       :storyPoints ${task.storyPoints || 0}
                       :labels [${(task.labels || []).map(l => `"${l}"`).join(' ')}]})
        
        (def board-clj {:columns [${board.columns.map(col => 
          `{:name "${col.name}" :limit ${col.limit || 0} :tasks []}`).join(' ')}]})
        
        ;; Evaluate the rule implementation with converted objects
        (let [task task-clj
              board board-clj]
          ${ruleImpl})
      `;

      // @ts-ignore - nbb dynamic evaluation
      const result = await nbb(clojureCode);
      return Boolean(result);
    } catch (error) {
      console.error('Failed to evaluate Clojure rule:', error);
      throw new Error(
        `Clojure evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get an overview of all transition rules for visualization
   */
  getTransitionsOverview(): {
    enabled: boolean;
    enforcementMode: string;
    dslAvailable: boolean;
    validTransitions: Array<{
      from: string;
      to: string;
      description?: string;
    }>;
    globalRules: string[];
  } {
    const validTransitions = this.config.rules.flatMap((rule) =>
      rule.from.flatMap((from) =>
        rule.to.map((to) => ({
          from,
          to,
          description: rule.description,
        })),
      ),
    );

    const globalRules = this.config.globalRules
      .filter((rule) => rule.enabled)
      .map((rule) => `${rule.name}: ${rule.description}`);

    return {
      enabled: this.config.enabled,
      enforcementMode: this.config.enforcement,
      dslAvailable: this.dslAvailable,
      validTransitions,
      globalRules,
    };
  }
}

/**
 * Load and create a transition rules engine from config
 */
export async function createTransitionRulesEngine(
  configPaths: string | string[],
): Promise<TransitionRulesEngine> {
  const paths = Array.isArray(configPaths) ? configPaths : [configPaths];

  for (const configPath of paths) {
    try {
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      const transitionConfig: TransitionRulesConfig = config.transitionRules || {
        enabled: false,
        enforcement: 'disabled',
        rules: [],
        customChecks: {},
        globalRules: [],
      };

      const engine = new TransitionRulesEngine(transitionConfig);
      await engine.initialize();

      return engine;
    } catch (error) {
      console.debug(`Failed to load config from ${configPath}:`, error);
      // Continue to next path
    }
  }

  // No valid configuration found - throw error
  throw new Error(
    `Failed to load transition rules configuration from any of the provided paths: ${paths.join(', ')}. Clojure DSL is required.`,
  );
}
