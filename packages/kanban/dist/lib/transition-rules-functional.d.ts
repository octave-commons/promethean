/**
 * Functional Transition Rules Engine
 *
 * This file contains pure functional implementations of transition rules operations.
 * These were previously instance methods on TransitionRulesEngine class.
 */
import type { Task, Board } from './types.js';
import type { TestingTransitionConfig } from './testing-transition/types.js';
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
export interface TransitionRulesEngineState {
    config: TransitionRulesConfig;
    dslAvailable: boolean;
    testingConfig: TestingTransitionConfig;
}
export declare const createTransitionRulesEngineState: (config?: TransitionRulesConfig) => TransitionRulesEngineState;
export declare const initializeTransitionRulesEngine: (state: TransitionRulesEngineState) => Promise<{
    newState: TransitionRulesEngineState;
}>;
export declare const validateTransition: (state: TransitionRulesEngineState, from: string, to: string, task: Task, board: Board) => Promise<{
    result: TransitionResult;
    newState: TransitionRulesEngineState;
}>;
export declare const getValidTransitions: (config: TransitionRulesConfig, from: string) => string[];
export declare const debugTransition: (state: TransitionRulesEngineState, from: string, to: string, task: Task, board: Board) => Promise<{
    debug: TransitionDebug;
    newState: TransitionRulesEngineState;
}>;
export declare const showProcessFlow: (config: TransitionRulesConfig) => string;
export declare const validateTestingToReviewTransition: (state: TransitionRulesEngineState, task: Task, _board: Board) => Promise<{
    allowed: boolean;
    violations: string[];
}>;
export declare const extractTestingInfo: (task: Task) => {
    coverageReportPath?: string;
    executedTests?: string[];
    requirementMappings?: Array<{
        requirementId: string;
        testIds: string[];
    }>;
};
export declare const getTransitionsOverview: (state: TransitionRulesEngineState) => {
    enabled: boolean;
    enforcementMode: string;
    dslAvailable: boolean;
    validTransitions: Array<{
        from: string;
        to: string;
        description?: string;
    }>;
    globalRules: string[];
};
export declare const normalizeColumnName: (column: string) => string;
export declare const findTransitionRule: (config: TransitionRulesConfig, from: string, to: string) => TransitionRule | undefined;
export declare const isBackwardTransition: (from: string, to: string) => boolean;
export declare const evaluateGlobalRule: (state: TransitionRulesEngineState, rule: GlobalRule, from: string, to: string, task: Task, board: Board) => Promise<boolean>;
export declare const evaluateWipLimit: (targetColumn: string, board: Board) => Promise<boolean>;
export declare const evaluateTaskExistence: (sourceColumn: string, task: Task, board: Board) => boolean;
export declare const evaluateCustomCheck: (state: TransitionRulesEngineState, checkName: string, task: Task, board: Board) => Promise<boolean>;
export declare const evaluateCustomRule: (state: TransitionRulesEngineState, ruleImpl: string, _args: any[], task: Task, board: Board) => Promise<boolean>;
//# sourceMappingURL=transition-rules-functional.d.ts.map