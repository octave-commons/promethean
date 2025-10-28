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
import type { Task, Board } from './types.js';
import type { TransitionRulesConfig, TransitionResult, TransitionDebug } from './transition-rules-functional.js';
/**
 * Transition Rules Engine
 *
 * Validates kanban board state transitions according to configured rules
 * and custom logic defined in Clojure DSL.
 *
 * @deprecated Use the functional implementations from './transition-rules-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */
export declare class TransitionRulesEngine {
    private state;
    constructor(config?: TransitionRulesConfig);
    /**
     * Initialize rules engine and check if Clojure DSL is available
     */
    initialize(): Promise<void>;
    /**
     * Check if a transition from one status to another is allowed
     */
    validateTransition(from: string, to: string, task: Task, board: Board): Promise<TransitionResult>;
    /**
     * Get all valid transitions from a given column
     */
    getValidTransitions(from: string): string[];
    /**
     * Debug why a transition was rejected or approved
     */
    debugTransition(from: string, to: string, task: Task, board: Board): Promise<TransitionDebug>;
    /**
     * Show current process flow as a graph
     */
    showProcessFlow(): string;
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
    };
    private normalizeColumnName;
    private findTransitionRule;
    private isBackwardTransition;
    private evaluateGlobalRule;
    private evaluateWipLimit;
    private evaluateTaskExistence;
    private evaluateCustomCheck;
    private evaluateCustomRule;
    private validateTestingToReviewTransition;
    private extractTestingInfo;
}
/**
 * Load and create a transition rules engine from config
 */
export declare function createTransitionRulesEngine(configPaths: string | string[]): Promise<TransitionRulesEngine>;
export type { TransitionRule, CustomCheck, GlobalRule, TransitionRulesConfig, TransitionResult, TransitionDebug, } from './transition-rules-functional.js';
//# sourceMappingURL=transition-rules.d.ts.map