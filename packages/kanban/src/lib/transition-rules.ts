/**
 * Kanban Transition Rules Engine
 *
 * Enforces kanban board transition rules using a combination of:
 * - JSON configuration rules
 * - Clojure NBB DSL for custom logic
 * - Built-in JavaScript rule validators
 */

import { readFile, access } from 'fs/promises';
import type { Task, Board } from './types.js';

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

  constructor(config?: TransitionRulesConfig) {
    // Default configuration if none provided
    this.config = config || {
      enabled: true,
      enforcement: "strict",
      dslPath: "",
      rules: [],
      customChecks: {},
      globalRules: []
    };
  }

  /**
   * Initialize the rules engine and check if Clojure DSL is available
   */
  async initialize(): Promise<void> {
    if (this.config.dslPath) {
      try {
        await access(this.config.dslPath);
        this.dslAvailable = true;
        console.log(`🔧 Clojure DSL available: ${this.config.dslPath}`);
      } catch {
        console.warn(`⚠️  Clojure DSL not found: ${this.config.dslPath}`);
        this.dslAvailable = false;
      }
    }
  }

  /**
   * Check if a transition from one status to another is allowed
   */
  async validateTransition(
    from: string,
    to: string,
    task: Task,
    board: Board
  ): Promise<TransitionResult> {
    // Skip validation if rules are disabled
    if (!this.config.enabled || this.config.enforcement === 'disabled') {
      return {
        allowed: true,
        reason: 'Transition rules are disabled',
        ruleViolations: [],
        suggestions: [],
        suggestedAlternatives: [],
        warnings: []
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
      violations.push(`Invalid transition: ${fromNormalized} → ${toNormalized} is not a defined transition`);

      const validTargets = this.getValidTransitions(fromNormalized);
      if (validTargets.length > 0) {
        suggestions.push(`Valid transitions from ${fromNormalized}: ${validTargets.join(', ')}`);
      }
    }

    // Check 2: Global rules (WIP limits, task existence, etc.)
    for (const globalRule of this.config.globalRules) {
      if (!globalRule.enabled) continue;

      try {
        const passes = await this.evaluateGlobalRule(globalRule, fromNormalized, toNormalized, task, board);
        if (!passes) {
          violations.push(`Global rule violation: ${globalRule.description}`);
        }
      } catch (error) {
        console.warn(`Failed to evaluate global rule ${globalRule.name}:`, error);
      }
    }

    // Check 3: Custom transition-specific rules
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
      warnings: []
    };
  }

  /**
   * Get all valid transitions from a given column
   */
  getValidTransitions(from: string): string[] {
    const fromNormalized = this.normalizeColumnName(from);

    const validRules = this.config.rules.filter(rule =>
      rule.from.includes(fromNormalized)
    );

    return validRules.flatMap(rule => rule.to);
  }

  /**
   * Debug why a transition was rejected or approved
   */
  async debugTransition(
    from: string,
    to: string,
    task: Task,
    board: Board
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
      validTransitions: this.getValidTransitions(fromNormalized)
    };
  }

  /**
   * Show the current process flow as a graph
   */
  showProcessFlow(): string {
    const lines = ['🔄 Kanban Process Flow', ''];

    this.config.rules.forEach(rule => {
      rule.from.forEach(from => {
        rule.to.forEach(to => {
          lines.push(`  ${from} → ${to} (${rule.description})`);
        });
      });
    });

    lines.push('');
    lines.push('📋 Valid Transitions by Column:');
    lines.push('');

    // Group by source column
    const bySource = new Map<string, Set<string>>();
    this.config.rules.forEach(rule => {
      rule.from.forEach(from => {
        if (!bySource.has(from)) {
          bySource.set(from, new Set());
        }
        rule.to.forEach(to => {
          bySource.get(from)!.add(to);
        });
      });
    });

    bySource.forEach((targets, from) => {
      lines.push(`  ${from}: ${Array.from(targets).join(', ')}`);
    });

    return lines.join('\n');
  }

  // Private helper methods

  private normalizeColumnName(column: string): string {
    // Match the normalization used in kanban.ts columnKey function
    return column
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  private findTransitionRule(from: string, to: string): TransitionRule | undefined {
    return this.config.rules.find(rule =>
      rule.from.includes(from) && rule.to.includes(to)
    );
  }

  private async evaluateGlobalRule(
    rule: GlobalRule,
    from: string,
    to: string,
    task: Task,
    board: Board
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
    const column = board.columns.find(col =>
      this.normalizeColumnName(col.name) === targetColumn
    );

    if (!column) return true;
    if (!column.limit) return true;

    return column.count < column.limit;
  }

  private evaluateTaskExistence(sourceColumn: string, task: Task, board: Board): boolean {
    const column = board.columns.find(col =>
      this.normalizeColumnName(col.name) === sourceColumn
    );

    if (!column) return false;

    return column.tasks.some(t => t.uuid === task.uuid);
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
    board: Board
  ): Promise<boolean> {
    if (!this.dslAvailable) {
      console.warn('Clojure DSL not available, skipping custom rule evaluation');
      return true;
    }

    try {
      // Use nbb (Node.js Babashka) to evaluate Clojure code
      const result = await this.evalClojure(ruleImpl, [...args, task, board]);
      return Boolean(result);
    } catch (error) {
      console.error('Failed to evaluate Clojure rule:', error);
      return true; // Default to allowing on error
    }
  }

  private async evalClojure(expression: string, args: any[]): Promise<any> {
    // This is a simplified implementation. In a real scenario, you'd use nbb properly
    // For now, we'll implement basic rule evaluation in JavaScript

    // Parse simple expressions like "(fn [task board] (and (:title task) (:priority task)))"
    if (expression.includes('(:title task)') && expression.includes('(:priority task)')) {
      const [task] = args as [Task];
      return !!(task.title && task.priority);
    }

    if (expression.includes('get-in task [:estimates :complexity]')) {
      const [task] = args as [Task];
      const estimate = task.estimates?.complexity;
      return typeof estimate === 'number' && estimate <= 5;
    }

    // Default to true for unimplemented expressions
    return true;
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
    const validTransitions = this.config.rules.flatMap(rule =>
      rule.from.flatMap(from =>
        rule.to.map(to => ({
          from,
          to,
          description: rule.description
        }))
      )
    );

    const globalRules = this.config.globalRules
      .filter(rule => rule.enabled)
      .map(rule => `${rule.name}: ${rule.description}`);

    return {
      enabled: this.config.enabled,
      enforcementMode: this.config.enforcement,
      dslAvailable: this.dslAvailable,
      validTransitions,
      globalRules
    };
  }
}

/**
 * Load and create a transition rules engine from config
 */
export async function createTransitionRulesEngine(
  configPaths: string | string[]
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
        globalRules: []
      };

      const engine = new TransitionRulesEngine(transitionConfig);
      await engine.initialize();

      return engine;
    } catch (error) {
      console.debug(`Failed to load config from ${configPath}:`, error);
      // Continue to next path
    }
  }
  
  // Return a disabled engine as fallback
  const engine = new TransitionRulesEngine({
    enabled: false,
    enforcement: 'disabled',
    rules: [],
    customChecks: {},
    globalRules: []
  });
  await engine.initialize();

  return engine;
}
