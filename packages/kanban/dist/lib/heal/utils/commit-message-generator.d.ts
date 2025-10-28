/**
 * Commit Message Generator for Git Workflow
 * Generates consistent, descriptive commit messages from scar context and task changes
 */
import type { ScarContext } from '../scar-context-types.js';
import type { Task } from '../../testing-transition/types.js';
/**
 * Commit message generation options
 */
export interface CommitMessageOptions {
    /** Maximum length for commit subject line */
    maxSubjectLength?: number;
    /** Whether to include task IDs in messages */
    includeTaskIds?: boolean;
    /** Whether to include file paths in messages */
    includeFilePaths?: boolean;
    /** Custom prefix for commit messages */
    prefix?: string;
}
/**
 * Task diff information
 */
export interface TaskDiff {
    /** Task that was modified */
    task: Task;
    /** Type of change */
    changeType: 'created' | 'modified' | 'deleted' | 'moved';
    /** Specific fields that changed */
    changedFields?: string[];
    /** Diff content if available */
    diff?: string;
}
/**
 * Commit message generator class
 */
export declare class CommitMessageGenerator {
    private readonly options;
    constructor(options?: CommitMessageOptions);
    /**
     * Generate commit message from scar context for pre-operation
     */
    generatePreOperationMessage(context: ScarContext): string;
    /**
     * Generate commit message from scar context for post-operation
     */
    generatePostOperationMessage(context: ScarContext, modifiedTasks: Task[]): string;
    /**
     * Generate commit message for task directory changes
     */
    generateTasksDirectoryMessage(taskDiffs: TaskDiff[]): string;
    /**
     * Generate commit message for kanban board changes
     */
    generateKanbanBoardMessage(reason: string, modifiedTasks: Task[]): string;
    /**
     * Generate commit message for dependency changes
     */
    generateDependenciesMessage(dependencies: string[], operation: 'install' | 'remove' | 'update'): string;
    /**
     * Generate commit message from task diff
     */
    generateFromTaskDiff(taskDiff: TaskDiff): string;
    /**
     * Generate scar narrative for commit
     */
    generateScarNarrative(scar: {
        tag: string;
        story: string;
        timestamp: Date;
    }): string;
    /**
     * Validate commit message format
     */
    validateMessage(message: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Generate subject line with prefix and length validation
     */
    private generateSubject;
    /**
     * Generate pre-operation body
     */
    private generatePreOperationBody;
    /**
     * Generate post-operation body
     */
    private generatePostOperationBody;
    /**
     * Generate tasks directory body
     */
    private generateTasksDirectoryBody;
    /**
     * Generate kanban board body
     */
    private generateKanbanBoardBody;
    /**
     * Generate dependencies body
     */
    private generateDependenciesBody;
    /**
     * Generate task diff body
     */
    private generateTaskDiffBody;
    /**
     * Generate scar narrative body
     */
    private generateScarNarrativeBody;
    /**
     * Get verb for change type
     */
    private getChangeTypeVerb;
    /**
     * Format commit message with subject and body
     */
    private formatCommitMessage;
}
/**
 * Create a commit message generator
 */
export declare function createCommitMessageGenerator(options?: CommitMessageOptions): CommitMessageGenerator;
//# sourceMappingURL=commit-message-generator.d.ts.map