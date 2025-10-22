/**
 * Kanban Transition Rules Engine
 *
 * Enforces kanban board transition rules using a combination of:
 * - JSON configuration rules
 * - Clojure NBB DSL for custom logic
 * - Built-in JavaScript rule validators
 * - Testing→review transition validation with coverage and quality gates
 *
 * @deprecated Use the functional implementations from './transition-rules-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */

import { readFile } from 'fs/promises';
import type { Task, Board } from './types.js';
import type {
  TransitionRule,
  GlobalRule,
  TransitionRulesConfig,
  TransitionResult,
  TransitionDebug,
} from './transition-rules-functional.js';

// Import functional implementations
import {
  createTransitionRulesEngineState,
  initializeTransitionRulesEngine,
  validateTransition as validateTransitionFn,
  getValidTransitions as getValidTransitionsFn,
  debugTransition as debugTransitionFn,
  showProcessFlow as showProcessFlowFn,
  validateTestingToReviewTransition as validateTestingToReviewTransitionFn,
  extractTestingInfo as extractTestingInfoFn,
  getTransitionsOverview as getTransitionsOverviewFn,
  normalizeColumnName,
  findTransitionRule,
  isBackwardTransition,
  evaluateGlobalRule as evaluateGlobalRuleFn,
  evaluateWipLimit,
  evaluateTaskExistence,
  evaluateCustomCheck as evaluateCustomCheckFn,
  evaluateCustomRule as evaluateCustomRuleFn,
  TransitionRulesEngineState,
} from './transition-rules-functional.js';

/**
 * Transition Rules Engine
 *
 * Validates kanban board state transitions according to configured rules
 * and custom logic defined in Clojure DSL.
 *
 * @deprecated Use the functional implementations from './transition-rules-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */
export class TransitionRulesEngine {
  private state: TransitionRulesEngineState;

  constructor(config?: TransitionRulesConfig) {
    this.state = createTransitionRulesEngineState(config);
  }

  /**
   * Initialize rules engine and check if Clojure DSL is available
   */
  async initialize(): Promise<void> {
    console.warn(
      'TransitionRulesEngine.initialize is deprecated. Use initializeTransitionRulesEngine from transition-rules-functional instead.',
    );
    const result = await initializeTransitionRulesEngine(this.state);
    this.state = result.newState;
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
    console.warn(
      'TransitionRulesEngine.validateTransition is deprecated. Use validateTransition from transition-rules-functional instead.',
    );
    const result = await validateTransitionFn(this.state, from, to, task, board);
    this.state = result.newState;
    return result.result;
  }

  /**
   * Get all valid transitions from a given column
   */
  getValidTransitions(from: string): string[] {
    console.warn(
      'TransitionRulesEngine.getValidTransitions is deprecated. Use getValidTransitions from transition-rules-functional instead.',
    );
    return getValidTransitionsFn(this.state.config, from);
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
    console.warn(
      'TransitionRulesEngine.debugTransition is deprecated. Use debugTransition from transition-rules-functional instead.',
    );
    const result = await debugTransitionFn(this.state, from, to, task, board);
    this.state = result.newState;
    return result.debug;
  }

  /**
   * Show current process flow as a graph
   */
  showProcessFlow(): string {
    console.warn(
      'TransitionRulesEngine.showProcessFlow is deprecated. Use showProcessFlow from transition-rules-functional instead.',
    );
    return showProcessFlowFn(this.state.config);
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
    console.warn(
      'TransitionRulesEngine.getTransitionsOverview is deprecated. Use getTransitionsOverview from transition-rules-functional instead.',
    );
    return getTransitionsOverviewFn(this.state);
  }

  // Private helper methods (deprecated - use functional versions instead)

  // @ts-expect-error - Part of deprecated API
  private normalizeColumnName(_column: string): string {
    console.warn(
      'TransitionRulesEngine.normalizeColumnName is deprecated. Use normalizeColumnName from transition-rules-functional instead.',
    );
    return normalizeColumnName(_column);
  }

  private findTransitionRule(_from: string, _to: string): TransitionRule | undefined {
    console.warn(
      'TransitionRulesEngine.findTransitionRule is deprecated. Use findTransitionRule from transition-rules-functional instead.',
    );
    return findTransitionRule(this.state.config, _from, _to);
  }

  private isBackwardTransition(_from: string, _to: string): boolean {
    console.warn(
      'TransitionRulesEngine.isBackwardTransition is deprecated. Use isBackwardTransition from transition-rules-functional instead.',
    );
    return isBackwardTransition(_from, _to);
  }

  private async evaluateGlobalRule(
    _rule: GlobalRule,
    _from: string,
    _to: string,
    _task: Task,
    _board: Board,
  ): Promise<boolean> {
    console.warn(
      'TransitionRulesEngine.evaluateGlobalRule is deprecated. Use evaluateGlobalRule from transition-rules-functional instead.',
    );
    return evaluateGlobalRuleFn(this.state, _rule, _from, _to, _task, _board);
  }

  private async evaluateWipLimit(_targetColumn: string, _board: Board): Promise<boolean> {
    console.warn(
      'TransitionRulesEngine.evaluateWipLimit is deprecated. Use evaluateWipLimit from transition-rules-functional instead.',
    );
    return evaluateWipLimit(_targetColumn, _board);
  }

  private evaluateTaskExistence(_sourceColumn: string, _task: Task, _board: Board): boolean {
    console.warn(
      'TransitionRulesEngine.evaluateTaskExistence is deprecated. Use evaluateTaskExistence from transition-rules-functional instead.',
    );
    return evaluateTaskExistence(_sourceColumn, _task, _board);
  }

  private async evaluateCustomCheck(
    _checkName: string,
    _task: Task,
    _board: Board,
  ): Promise<boolean> {
    console.warn(
      'TransitionRulesEngine.evaluateCustomCheck is deprecated. Use evaluateCustomCheck from transition-rules-functional instead.',
    );
    return evaluateCustomCheckFn(this.state, _checkName, _task, _board);
  }

  private async evaluateCustomRule(
    _ruleImpl: string,
    __args: any[],
    _task: Task,
    _board: Board,
  ): Promise<boolean> {
    console.warn(
      'TransitionRulesEngine.evaluateCustomRule is deprecated. Use evaluateCustomRule from transition-rules-functional instead.',
    );
    return evaluateCustomRuleFn(this.state, _ruleImpl, __args, _task, _board);
  }

  private async validateTestingToReviewTransition(
    _task: Task,
    _board: Board,
  ): Promise<{ allowed: boolean; violations: string[] }> {
    console.warn(
      'TransitionRulesEngine.validateTestingToReviewTransition is deprecated. Use validateTestingToReviewTransition from transition-rules-functional instead.',
    );
    return validateTestingToReviewTransitionFn(this.state, _task, _board);
  }

  private extractTestingInfo(_task: Task): {
    coverageReportPath?: string;
    executedTests?: string[];
    requirementMappings?: Array<{ requirementId: string; testIds: string[] }>;
  } {
    console.warn(
      'TransitionRulesEngine.extractTestingInfo is deprecated. Use extractTestingInfo from transition-rules-functional instead.',
    );
    return extractTestingInfoFn(_task);
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

// Re-export types for backward compatibility
export type {
  TransitionRule,
  CustomCheck,
  GlobalRule,
  TransitionRulesConfig,
  TransitionResult,
  TransitionDebug,
} from './transition-rules-functional.js';
