#!/usr/bin/env node
/**
 * P0 Security Task Validation Gate
 *
 * This module implements comprehensive security validation for P0 priority tasks
 * to ensure they meet strict security requirements before advancing through workflow.
 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
/**
 * Creates a P0 security validator with the specified options
 */
export function createP0SecurityValidator(options = {}) {
    return new P0SecurityValidator(options);
}
/**
 * P0 Security Task Validator
 *
 * Validates P0 priority security tasks against comprehensive security requirements
 * before allowing status transitions in the kanban workflow.
 */
export class P0SecurityValidator {
    repoRoot;
    tasksDir;
    skipGitChecks;
    skipFileChecks;
    constructor(options = {}) {
        this.repoRoot = options.repoRoot || process.cwd();
        this.tasksDir = options.tasksDir || path.join(this.repoRoot, 'docs/agile/tasks');
        this.skipGitChecks = options.skipGitChecks || false;
        this.skipFileChecks = options.skipFileChecks || false;
    }
    /**
     * Validates if a task is a P0 security task
     */
    isP0SecurityTask(task) {
        return task.priority === 'P0' &&
            (task.labels?.includes('security') ||
                task.labels?.includes('security-gates') ||
                task.title.toLowerCase().includes('security') ||
                task.title.toLowerCase().includes('vulnerability') ||
                task.title.toLowerCase().includes('fix'));
    }
    /**
     * Validates P0 security task requirements for a specific status transition
     */
    async validateStatusTransition(task, fromStatus, toStatus) {
        // Only validate P0 security tasks
        if (!this.isP0SecurityTask(task)) {
            return {
                valid: true,
                errors: [],
                warnings: [],
                requirements: this.getEmptyRequirements()
            };
        }
        const requirements = await this.checkRequirements(task, fromStatus, toStatus);
        const errors = this.generateValidationErrors(requirements, fromStatus, toStatus);
        const warnings = this.generateValidationWarnings(requirements, fromStatus, toStatus);
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            requirements
        };
    }
    /**
     * Checks all P0 security requirements for a task
     */
    async checkRequirements(task, fromStatus, toStatus) {
        const requirements = this.getEmptyRequirements();
        // Always check for implementation plan
        requirements.hasImplementationPlan = await this.checkImplementationPlan(task);
        // Check code changes for transitions beyond 'todo'
        if (this.shouldCheckCodeChanges(fromStatus, toStatus)) {
            requirements.hasCodeChanges = await this.checkCodeChanges(task);
        }
        // Check security review for transitions to 'testing' or beyond
        if (this.shouldCheckSecurityReview(fromStatus, toStatus)) {
            requirements.hasSecurityReview = await this.checkSecurityReview(task);
        }
        // Check test coverage for transitions to 'testing' or beyond
        if (this.shouldCheckTestCoverage(fromStatus, toStatus)) {
            requirements.hasTestCoverage = await this.checkTestCoverage(task);
        }
        // Check documentation for transitions to 'done'
        if (this.shouldCheckDocumentation(fromStatus, toStatus)) {
            requirements.hasDocumentation = await this.checkDocumentation(task);
        }
        return requirements;
    }
    /**
     * Returns empty requirements object
     */
    getEmptyRequirements() {
        return {
            hasImplementationPlan: false,
            hasCodeChanges: false,
            hasSecurityReview: false,
            hasTestCoverage: false,
            hasDocumentation: false
        };
    }
    /**
     * Determines if code changes should be checked for this transition
     */
    shouldCheckCodeChanges(fromStatus, toStatus) {
        const fromKey = this.normalizeStatus(fromStatus);
        const toKey = this.normalizeStatus(toStatus);
        // Check code changes when moving from planning to active work
        return (fromKey === 'todo' || fromKey === 'ready') &&
            (toKey === 'in_progress' || toKey === 'inprogress');
    }
    /**
     * Determines if security review should be checked for this transition
     */
    shouldCheckSecurityReview(fromStatus, toStatus) {
        const fromKey = this.normalizeStatus(fromStatus);
        const toKey = this.normalizeStatus(toStatus);
        // Check security review when moving to testing or review phases
        return (fromKey === 'in_progress' || fromKey === 'inprogress') &&
            (toKey === 'testing' || toKey === 'review' || toKey === 'in_review');
    }
    /**
     * Determines if test coverage should be checked for this transition
     */
    shouldCheckTestCoverage(fromStatus, toStatus) {
        const fromKey = this.normalizeStatus(fromStatus);
        const toKey = this.normalizeStatus(toStatus);
        // Check test coverage when moving to testing phase
        return (fromKey === 'in_progress' || fromKey === 'inprogress') && toKey === 'testing';
    }
    /**
     * Determines if documentation should be checked for this transition
     */
    shouldCheckDocumentation(fromStatus, toStatus) {
        const fromKey = this.normalizeStatus(fromStatus);
        const toKey = this.normalizeStatus(toStatus);
        // Check documentation when moving to completion
        return (fromKey === 'review' || fromKey === 'in_review' || toKey === 'document') &&
            toKey === 'done';
    }
    /**
     * Normalizes status names for comparison
     */
    normalizeStatus(status) {
        return status.toLowerCase().replace(/[-_\s]/g, '');
    }
    /**
     * Checks if task has an implementation plan
     */
    async checkImplementationPlan(task) {
        if (this.skipFileChecks)
            return true;
        try {
            const taskFilePath = await this.getTaskFilePath(task);
            if (!taskFilePath)
                return false;
            const content = await readFile(taskFilePath, 'utf8');
            // Check for implementation plan indicators
            const planIndicators = [
                /implementation plan/i,
                /implementation details/i,
                /technical approach/i,
                /solution design/i,
                /## implementation/i,
                /### implementation/i,
                /## technical/i,
                /### technical/i,
                /## approach/i,
                /### approach/i
            ];
            return planIndicators.some(indicator => indicator.test(content));
        }
        catch (error) {
            console.warn(`Warning: Could not check implementation plan for task ${task.uuid}:`, error);
            return false;
        }
    }
    /**
     * Checks if task has committed code changes
     */
    /**
     * Checks if task has committed code changes
     */
    async checkCodeChanges(task) {
        if (this.skipGitChecks)
            return true;
        try {
            // Use the git integration module for more robust checking
            const { hasTaskCodeChanges } = await import('./git-integration.js');
            return await hasTaskCodeChanges({
                repoRoot: this.repoRoot,
                sinceDate: task.created_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                taskUuid: task.uuid,
                taskTitle: task.title,
                maxCommits: 100
            });
        }
        catch (error) {
            console.warn(`Warning: Could not check code changes for task ${task.uuid}:`, error);
            return false;
        }
    }
    /**
     * Checks if task has completed security review
     */
    async checkSecurityReview(task) {
        if (this.skipFileChecks)
            return true;
        try {
            const taskFilePath = await this.getTaskFilePath(task);
            if (!taskFilePath)
                return false;
            const content = await readFile(taskFilePath, 'utf8');
            // Check for security review completion indicators
            const reviewIndicators = [
                /security review.*completed/i,
                /security review.*done/i,
                /security.*reviewed/i,
                /reviewed.*security/i,
                /security.*approved/i,
                /approved.*security/i,
                /security.*sign.?off/i,
                /sign.?off.*security/i,
                /labels.*security-reviewed/i,
                /security-reviewed/i
            ];
            // Also check task labels
            const hasSecurityLabel = task.labels?.includes('security-reviewed') ||
                task.labels?.includes('security-approved') ||
                task.labels?.includes('security-sign-off');
            return reviewIndicators.some(indicator => indicator.test(content)) || hasSecurityLabel || false;
        }
        catch (error) {
            console.warn(`Warning: Could not check security review for task ${task.uuid}:`, error);
            return false;
        }
    }
    /**
     * Checks if task has defined test coverage
     */
    async checkTestCoverage(task) {
        if (this.skipFileChecks)
            return true;
        try {
            const taskFilePath = await this.getTaskFilePath(task);
            if (!taskFilePath)
                return false;
            const content = await readFile(taskFilePath, 'utf8');
            // Check for test coverage indicators
            const testIndicators = [
                /test plan/i,
                /test coverage/i,
                /test cases/i,
                /testing strategy/i,
                /## tests/i,
                /### tests/i,
                /## test/i,
                /### test/i,
                /unit tests/i,
                /integration tests/i,
                /security tests/i,
                /test.*requirements/i,
                /testing.*requirements/i
            ];
            return testIndicators.some(indicator => indicator.test(content));
        }
        catch (error) {
            console.warn(`Warning: Could not check test coverage for task ${task.uuid}:`, error);
            return false;
        }
    }
    /**
     * Checks if task has updated documentation
     */
    async checkDocumentation(task) {
        if (this.skipFileChecks)
            return true;
        try {
            const taskFilePath = await this.getTaskFilePath(task);
            if (!taskFilePath)
                return false;
            const content = await readFile(taskFilePath, 'utf8');
            // Check for documentation indicators
            const docIndicators = [
                /documentation.*updated/i,
                /updated.*documentation/i,
                /docs.*updated/i,
                /updated.*docs/i,
                /## documentation/i,
                /### documentation/i,
                /## docs/i,
                /### docs/i,
                /readme.*updated/i,
                /updated.*readme/i
            ];
            return docIndicators.some(indicator => indicator.test(content));
        }
        catch (error) {
            console.warn(`Warning: Could not check documentation for task ${task.uuid}:`, error);
            return false;
        }
    }
    /**
     * Gets the file path for a task
     */
    async getTaskFilePath(task) {
        try {
            // Try different possible file names
            const possibleNames = [
                `${task.uuid}.md`,
                `${task.slug}.md`,
                `${task.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.md`
            ];
            for (const name of possibleNames) {
                const filePath = path.join(this.tasksDir, name);
                try {
                    await access(filePath);
                    return filePath;
                }
                catch {
                    // File doesn't exist, try next
                }
            }
            return null;
        }
        catch (error) {
            console.warn(`Warning: Could not determine file path for task ${task.uuid}:`, error);
            return null;
        }
    }
    /**
     * Generates validation errors based on requirements and transition
     */
    generateValidationErrors(requirements, fromStatus, toStatus) {
        const errors = [];
        const fromKey = this.normalizeStatus(fromStatus);
        const toKey = this.normalizeStatus(toStatus);
        // Implementation plan errors
        if (!requirements.hasImplementationPlan) {
            errors.push('P0 security tasks require an implementation plan before starting work');
        }
        // Code changes errors
        if (this.shouldCheckCodeChanges(fromStatus, toStatus) && !requirements.hasCodeChanges) {
            errors.push('P0 security tasks require committed code changes to move to in-progress');
        }
        // Security review errors
        if (this.shouldCheckSecurityReview(fromStatus, toStatus) && !requirements.hasSecurityReview) {
            errors.push('P0 security tasks require completed security review before testing');
        }
        // Test coverage errors
        if (this.shouldCheckTestCoverage(fromStatus, toStatus) && !requirements.hasTestCoverage) {
            errors.push('P0 security tasks require defined test coverage plan before testing');
        }
        // Documentation errors
        if (this.shouldCheckDocumentation(fromStatus, toStatus) && !requirements.hasDocumentation) {
            errors.push('P0 security tasks require updated documentation before completion');
        }
        return errors;
    }
    /**
     * Generates validation warnings based on requirements and transition
     */
    generateValidationWarnings(requirements, fromStatus, toStatus) {
        const warnings = [];
        // Add warnings for partial compliance
        if (!requirements.hasImplementationPlan) {
            warnings.push('Consider adding an implementation plan to improve task clarity');
        }
        if (!requirements.hasCodeChanges && this.shouldCheckCodeChanges(fromStatus, toStatus)) {
            warnings.push('Code changes should be committed before status transitions');
        }
        if (!requirements.hasSecurityReview && this.shouldCheckSecurityReview(fromStatus, toStatus)) {
            warnings.push('Security review should be completed before testing phase');
        }
        if (!requirements.hasTestCoverage && this.shouldCheckTestCoverage(fromStatus, toStatus)) {
            warnings.push('Test coverage plan helps ensure comprehensive validation');
        }
        if (!requirements.hasDocumentation && this.shouldCheckDocumentation(fromStatus, toStatus)) {
            warnings.push('Documentation updates help maintain system knowledge');
        }
        return warnings;
    }
}
/**
 * Default P0 security validator instance
 */
export const defaultP0SecurityValidator = createP0SecurityValidator();
/**
 * Convenience function to validate P0 security task status transition
 */
export async function validateP0SecurityTask(task, fromStatus, toStatus, options) {
    const validator = createP0SecurityValidator(options);
    return validator.validateStatusTransition(task, fromStatus, toStatus);
}
//# sourceMappingURL=p0-security-validator.js.map