/**
 * Functional Transition Rules Engine
 *
 * This file contains pure functional implementations of transition rules operations.
 * These were previously instance methods on TransitionRulesEngine class.
 */

import { readFile, access } from 'fs/promises';
import type { Task, Board } from './types.js';
import { runTestingTransition } from './testing-transition/index.js';
import type { TestingTransitionConfig, TestCoverageRequest } from './testing-transition/types.js';
// Define types locally to avoid circular imports
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

// Transition rules engine state interface
export interface TransitionRulesEngineState {
  config: TransitionRulesConfig;
  dslAvailable: boolean;
  testingConfig: TestingTransitionConfig;
}

// Create initial transition rules engine state
export const createTransitionRulesEngineState = (
  config?: TransitionRulesConfig,
): TransitionRulesEngineState => {
  const defaultConfig = config || {
    enabled: true,
    enforcement: 'strict',
    dslPath: '',
    rules: [],
    customChecks: {},
    globalRules: [],
  };

  const defaultTestingConfig: TestingTransitionConfig = {
    enabled: true,
    scoring: {
      enabled: true,
      weights: {
        coverage: 0.35,
        quality: 0.25,
        requirementMapping: 0.2,
        aiAnalysis: 0.15,
        performance: 0.05,
      },
      priorityThresholds: {
        P0: { coverage: 95, quality: 90, overall: 92 },
        P1: { coverage: 90, quality: 85, overall: 87 },
        P2: { coverage: 85, quality: 80, overall: 82 },
        P3: { coverage: 80, quality: 75, overall: 77 },
      },
      adaptiveThresholds: false,
      historicalTrending: false,
    },
    thresholds: {
      coverage: 90,
      quality: 75,
      softBlock: 90,
      hardBlock: 75,
    },
    hardBlockCoverageThreshold: 75,
    softBlockQualityScoreThreshold: 90,
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

  return {
    config: defaultConfig,
    dslAvailable: false,
    testingConfig: defaultTestingConfig,
  };
};

// Initialize rules engine and check if Clojure DSL is available
export const initializeTransitionRulesEngine = async (
  state: TransitionRulesEngineState,
): Promise<{ newState: TransitionRulesEngineState }> => {
  if (!state.config.dslPath) {
    throw new Error(
      'Clojure DSL path is required. TypeScript transition rules are no longer supported.',
    );
  }

  try {
    await access(state.config.dslPath);
    const newState = {
      ...state,
      dslAvailable: true,
    };
    console.log(`🔧 Clojure DSL available: ${state.config.dslPath}`);
    return { newState };
  } catch {
    throw new Error(
      `Clojure DSL not found at: ${state.config.dslPath}. Transition rules cannot function without Clojure DSL.`,
    );
  }
};

// Check if a transition from one status to another is allowed
export const validateTransition = async (
  state: TransitionRulesEngineState,
  from: string,
  to: string,
  task: Task,
  board: Board,
): Promise<{ result: TransitionResult; newState: TransitionRulesEngineState }> => {
  // Skip validation if rules are disabled
  if (!state.config.enabled || state.config.enforcement === 'disabled') {
    return {
      result: {
        allowed: true,
        reason: 'Transition rules are disabled',
        ruleViolations: [],
        suggestions: [],
        suggestedAlternatives: [],
        warnings: [],
      },
      newState: state,
    };
  }

  const violations: string[] = [];
  const suggestions: string[] = [];

  // Normalize column names
  const fromNormalized = normalizeColumnName(from);
  const toNormalized = normalizeColumnName(to);

  // Check 1: Is this a defined transition?
  const transitionRule = findTransitionRule(state.config, fromNormalized, toNormalized);
  if (!transitionRule) {
    // Check if this is a backward transition
    if (isBackwardTransition(fromNormalized, toNormalized)) {
      console.log(`✅ Backward transition allowed: ${fromNormalized} → ${toNormalized}`);
    } else {
      // If DSL is available, we'll let the DSL decide if the transition is valid
      // This allows the DSL to be the sole authority on transition rules
      if (!state.dslAvailable) {
        violations.push(
          `Invalid transition: ${fromNormalized} → ${toNormalized} is not a defined transition`,
        );

        const validTargets = getValidTransitions(state.config, fromNormalized);
        if (validTargets.length > 0) {
          suggestions.push(`Valid transitions from ${fromNormalized}: ${validTargets.join(', ')}`);
        }
      }
    }
  }

  // Check 2: Global rules (WIP limits, task existence, etc.)
  for (const globalRule of state.config.globalRules) {
    if (!globalRule.enabled) continue;

    try {
      const passes = await evaluateGlobalRule(
        state,
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
      const testingResult = await validateTestingToReviewTransition(state, task, board);
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
      const passes = await evaluateCustomCheck(state, transitionRule.check, task, board);
      if (!passes) {
        violations.push(`Transition check failed: ${transitionRule.description}`);
      }
    } catch (error) {
      console.warn(`Failed to evaluate transition check ${transitionRule.check}:`, error);
    }
  }

  // Check 5: Evaluate Clojure DSL's evaluate-transition function
  if (state.dslAvailable) {
    try {
      const dslResult = await evaluateCustomRule(
        state,
        `(evaluate-transition "${fromNormalized}" "${toNormalized}" task board)`,
        [],
        task,
        board,
      );
      if (!dslResult) {
        violations.push(
          `Clojure DSL evaluation: transition ${fromNormalized} → ${toNormalized} is not allowed`,
        );
      }
    } catch (error) {
      console.warn(`Failed to evaluate Clojure DSL transition:`, error);
      violations.push(
        `Clojure DSL evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  const allowed = violations.length === 0;
  const reason = allowed
    ? `Transition ${fromNormalized} → ${toNormalized} is allowed`
    : `Transition blocked: ${violations.join('; ')}`;

  const result: TransitionResult = {
    allowed,
    reason,
    ruleViolations: violations,
    suggestions,
    suggestedAlternatives: suggestions,
    warnings: [],
  };

  return { result, newState: state };
};

// Get all valid transitions from a given column
export const getValidTransitions = (config: TransitionRulesConfig, from: string): string[] => {
  const fromNormalized = normalizeColumnName(from);

  const validRules = config.rules.filter((rule) => rule.from.includes(fromNormalized));

  return validRules.flatMap((rule) => rule.to);
};

// Debug why a transition was rejected or approved
export const debugTransition = async (
  state: TransitionRulesEngineState,
  from: string,
  to: string,
  task: Task,
  board: Board,
): Promise<{ debug: TransitionDebug; newState: TransitionRulesEngineState }> => {
  const fromNormalized = normalizeColumnName(from);
  const toNormalized = normalizeColumnName(to);

  // Evaluate WIP check
  const wipCheck = await evaluateWipLimit(toNormalized, board);

  // Evaluate task existence check
  const existenceCheck = evaluateTaskExistence(fromNormalized, task, board);

  const debug: TransitionDebug = {
    from: fromNormalized,
    to: toNormalized,
    task,
    wipCheck,
    existenceCheck,
    validTransitions: getValidTransitions(state.config, fromNormalized),
  };

  return { debug, newState: state };
};

// Show current process flow as a graph
export const showProcessFlow = (config: TransitionRulesConfig): string => {
  const lines = ['🔄 Kanban Process Flow', ''];

  config.rules.forEach((rule) => {
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
  config.rules.forEach((rule) => {
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
};

// Validate testing→review transition with coverage and quality gates
export const validateTestingToReviewTransition = async (
  state: TransitionRulesEngineState,
  task: Task,
  _board: Board,
): Promise<{ allowed: boolean; violations: string[] }> => {
  const violations: string[] = [];

  try {
    // Extract testing information from task content or metadata
    const testingInfo = extractTestingInfo(task);

    if (!testingInfo.coverageReportPath) {
      violations.push('No coverage report path specified in task');
      return { allowed: false, violations };
    }

    // Set up timeout for performance validation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('Testing transition validation timeout')),
        state.testingConfig.timeouts.totalAnalysis,
      );
    });

    // Run testing transition validation with timeout
    const validationPromise = runTestingValidation(state, task, testingInfo);

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
};

// Extract testing information from task
export const extractTestingInfo = (
  task: Task,
): {
  coverageReportPath?: string;
  executedTests?: string[];
  requirementMappings?: Array<{ requirementId: string; testIds: string[] }>;
} => {
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
};

// Get an overview of all transition rules for visualization
export const getTransitionsOverview = (
  state: TransitionRulesEngineState,
): {
  enabled: boolean;
  enforcementMode: string;
  dslAvailable: boolean;
  validTransitions: Array<{
    from: string;
    to: string;
    description?: string;
  }>;
  globalRules: string[];
} => {
  const validTransitions = state.config.rules.flatMap((rule) =>
    rule.from.flatMap((from) =>
      rule.to.map((to) => ({
        from,
        to,
        description: rule.description,
      })),
    ),
  );

  const globalRules = state.config.globalRules
    .filter((rule) => rule.enabled)
    .map((rule) => `${rule.name}: ${rule.description}`);

  return {
    enabled: state.config.enabled,
    enforcementMode: state.config.enforcement,
    dslAvailable: state.dslAvailable,
    validTransitions,
    globalRules,
  };
};

// Helper functions

export const normalizeColumnName = (column: string): string => {
  // Match normalization used in kanban.ts columnKey function
  return column
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars
};

export const findTransitionRule = (
  config: TransitionRulesConfig,
  from: string,
  to: string,
): TransitionRule | undefined => {
  return config.rules.find((rule) => rule.from.includes(from) && rule.to.includes(to));
};

export const isBackwardTransition = (from: string, to: string): boolean => {
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
};

export const evaluateGlobalRule = async (
  state: TransitionRulesEngineState,
  rule: GlobalRule,
  from: string,
  to: string,
  task: Task,
  board: Board,
): Promise<boolean> => {
  // Special handling for built-in global rules
  switch (rule.name) {
    case 'wip-limits':
      return await evaluateWipLimit(to, board);

    case 'task-existence':
      return evaluateTaskExistence(from, task, board);

    default:
      return await evaluateCustomRule(state, rule.impl, [from, to], task, board);
  }
};

export const evaluateWipLimit = async (targetColumn: string, board: Board): Promise<boolean> => {
  const column = board.columns.find((col) => normalizeColumnName(col.name) === targetColumn);

  if (!column) return true;
  if (!column.limit) return true;

  return column.count < column.limit;
};

export const evaluateTaskExistence = (sourceColumn: string, task: Task, board: Board): boolean => {
  const column = board.columns.find((col) => normalizeColumnName(col.name) === sourceColumn);

  if (!column) return false;

  return column.tasks.some((t) => t.uuid === task.uuid);
};

export const evaluateCustomCheck = async (
  state: TransitionRulesEngineState,
  checkName: string,
  task: Task,
  board: Board,
): Promise<boolean> => {
  const check = state.config.customChecks[checkName];
  if (!check) {
    console.warn(`Custom check not found: ${checkName}`);
    return true; // Default to allowing if check is missing
  }

  return await evaluateCustomRule(state, check.impl, [], task, board);
};

export const evaluateCustomRule = async (
  state: TransitionRulesEngineState,
  ruleImpl: string,
  _args: any[],
  task: Task,
  board: Board,
): Promise<boolean> => {
  if (!state.dslAvailable) {
    throw new Error(
      'Clojure DSL is required but not available. TypeScript transition rules are no longer supported.',
    );
  }

  try {
    console.log('🔍 Starting nbb import...');
    // Use nbb (Node.js Babashka) to evaluate Clojure expressions with timeout
    const { loadString } = await Promise.race([
      import('nbb').then((module) => {
        console.log('🔍 nbb imported successfully');
        return module;
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          console.log('🔍 nbb import timeout triggered');
          reject(new Error('nbb import timeout after 5 seconds'));
        }, 5000),
      ),
    ]);

    // Load the Clojure DSL file
    const dslCode = await readFile(state.config.dslPath!, 'utf-8');

    // Create a safe evaluation context with DSL loaded
    const clojureCode = `
      ${dslCode}

      ;; Convert JavaScript objects to Clojure maps for evaluation
      (def task-clj {:uuid "${task.uuid}"
                     :title "${task.title}"
                     :priority "${task.priority}"
                     :content "${task.content || ''}"
                     :status "${task.status}"
                     :estimates {:complexity ${task.estimates?.complexity || 999}}
                     :storyPoints ${task.storyPoints || 0}
                     :labels [${(task.labels || []).map((l) => `"${l}"`).join(' ')}]})

      (def board-clj {:columns [${board.columns
        .map((col) => `{:name "${col.name}" :limit ${col.limit || 0} :tasks []}`)
        .join(' ')}]})

      ;; Evaluate rule implementation with converted objects
      (let [task task-clj
            board board-clj]
        ${ruleImpl.replace('kanban-transitions/evaluate-transition', 'evaluate-transition')})
    `;

    // @ts-ignore - nbb dynamic evaluation
    console.log('🔍 Evaluating Clojure code:', clojureCode);
    const result = await loadString(clojureCode, {
      context: 'cljs.user',
      print: console.log,
    });
    console.log('🔍 Clojure evaluation result:', result, typeof result);
    return Boolean(result);
  } catch (error) {
    console.error('Failed to evaluate Clojure rule:', error);
    throw new Error(
      `Clojure evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

// Run testing validation (helper function)
const runTestingValidation = async (
  state: TransitionRulesEngineState,
  task: Task,
  testingInfo: {
    coverageReportPath?: string;
    executedTests?: string[];
    requirementMappings?: any[];
  },
): Promise<void> => {
  const request: TestCoverageRequest = {
    task: {
      uuid: task.uuid,
      title: task.title,
      content: task.content,
      status: task.status,
      priority: task.priority ? String(task.priority) : undefined,
      tags: task.labels || [],
      frontmatter: task.frontmatter || {},
    } as any, // Type assertion to handle interface differences
    changedFiles: [],
    affectedPackages: [],
    reportPath: testingInfo.coverageReportPath!,
    format: 'json',
  };

  await runTestingTransition(
    request,
    testingInfo.executedTests || [],
    testingInfo.requirementMappings || [],
    state.testingConfig,
    [], // testFiles - empty for now
    '/tmp', // outputDir - temporary
  );
};
