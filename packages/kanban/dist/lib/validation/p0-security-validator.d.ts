#!/usr/bin/env node
/**
 * P0 Security Task Validation Gate
 *
 * This module implements comprehensive security validation for P0 priority tasks
 * to ensure they meet strict security requirements before advancing through workflow.
 */
import { Task } from '../types.js';
export interface P0ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    requirements: P0ValidationRequirements;
}
export interface P0ValidationRequirements {
    hasImplementationPlan: boolean;
    hasCodeChanges: boolean;
    hasSecurityReview: boolean;
    hasTestCoverage: boolean;
    hasDocumentation: boolean;
}
export interface P0SecurityValidatorOptions {
    repoRoot?: string;
    tasksDir?: string;
    skipGitChecks?: boolean;
    skipFileChecks?: boolean;
}
/**
 * Creates a P0 security validator with the specified options
 */
export declare function createP0SecurityValidator(options?: P0SecurityValidatorOptions): P0SecurityValidator;
/**
 * P0 Security Task Validator
 *
 * Validates P0 priority security tasks against comprehensive security requirements
 * before allowing status transitions in the kanban workflow.
 */
export declare class P0SecurityValidator {
    private readonly repoRoot;
    private readonly tasksDir;
    private readonly skipGitChecks;
    private readonly skipFileChecks;
    constructor(options?: P0SecurityValidatorOptions);
    /**
     * Validates if a task is a P0 security task
     */
    isP0SecurityTask(task: Task): boolean;
    /**
     * Validates P0 security task requirements for a specific status transition
     */
    validateStatusTransition(task: Task, fromStatus: string, toStatus: string): Promise<P0ValidationResult>;
    /**
     * Checks all P0 security requirements for a task
     */
    private checkRequirements;
    /**
     * Returns empty requirements object
     */
    private getEmptyRequirements;
    /**
     * Determines if code changes should be checked for this transition
     */
    private shouldCheckCodeChanges;
    /**
     * Determines if security review should be checked for this transition
     */
    private shouldCheckSecurityReview;
    /**
     * Determines if test coverage should be checked for this transition
     */
    private shouldCheckTestCoverage;
    /**
     * Determines if documentation should be checked for this transition
     */
    private shouldCheckDocumentation;
    /**
     * Normalizes status names for comparison
     */
    private normalizeStatus;
    /**
     * Checks if task has an implementation plan
     */
    private checkImplementationPlan;
    /**
     * Checks if task has committed code changes
     */
    /**
     * Checks if task has committed code changes
     */
    private checkCodeChanges;
    /**
     * Checks if task has completed security review
     */
    private checkSecurityReview;
    /**
     * Checks if task has defined test coverage
     */
    private checkTestCoverage;
    /**
     * Checks if task has updated documentation
     */
    private checkDocumentation;
    /**
     * Gets the file path for a task
     */
    private getTaskFilePath;
    /**
     * Generates validation errors based on requirements and transition
     */
    private generateValidationErrors;
    /**
     * Generates validation warnings based on requirements and transition
     */
    private generateValidationWarnings;
}
/**
 * Default P0 security validator instance
 */
export declare const defaultP0SecurityValidator: P0SecurityValidator;
/**
 * Convenience function to validate P0 security task status transition
 */
export declare function validateP0SecurityTask(task: Task, fromStatus: string, toStatus: string, options?: P0SecurityValidatorOptions): Promise<P0ValidationResult>;
//# sourceMappingURL=p0-security-validator.d.ts.map