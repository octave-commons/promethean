import type { Task } from '../types.js';
import type { TaskSection, TaskContentResult, TaskBodyUpdateRequest, SectionUpdateRequest, TaskValidationResult } from './types.js';
import { TaskLifecycleManager } from './lifecycle.js';
/**
 * Task Cache for efficient task file operations
 */
export interface TaskCache {
    tasksDir: string;
    getTaskPath: (uuid: string) => Promise<string | null>;
    readTask: (uuid: string) => Promise<Task | null>;
    writeTask: (task: Task) => Promise<void>;
    backupTask: (uuid: string) => Promise<string | undefined>;
}
export declare class FileBasedTaskCache implements TaskCache {
    readonly tasksDir: string;
    constructor(tasksDir: string);
    getTaskPath(uuid: string): Promise<string | null>;
    readTask(uuid: string): Promise<Task | null>;
    writeTask(task: Task): Promise<void>;
    backupTask(uuid: string): Promise<string | undefined>;
}
/**
 * High-level task content management operations
 */
export declare class TaskContentManager {
    private readonly cache;
    constructor(cache: TaskCache);
    /**
     * Read a task by UUID
     */
    readTask(uuid: string): Promise<Task | null>;
    /**
     * Update the entire body content of a task
     */
    updateTaskBody(request: TaskBodyUpdateRequest): Promise<TaskContentResult>;
    /**
     * Update a specific section within a task
     */
    updateTaskSection(request: SectionUpdateRequest): Promise<TaskContentResult>;
    /**
     * Get sections of a task
     */
    getTaskSections(uuid: string): Promise<TaskSection[]>;
    /**
     * Analyze task content
     */
    analyzeTaskContent(uuid: string): Promise<{
        sections: TaskSection[];
        validation: TaskValidationResult;
        analysis: any;
        wordCount: number;
        characterCount: number;
        estimatedReadingTime: number;
    } | null>;
}
/**
 * Create a task lifecycle manager instance
 */
export declare function createTaskLifecycleManager(contentManager: TaskContentManager, tasksDir: string, archiveDir?: string): TaskLifecycleManager;
/**
 * Create a task content manager instance
 */
export declare function createTaskContentManager(tasksDir: string): TaskContentManager;
export type { TaskSection, TaskContentResult, TaskBodyUpdateRequest, SectionUpdateRequest, TaskValidationResult, TaskArchiveRequest, TaskDeleteRequest, TaskMergeRequest, TaskLifecycleOptions, TaskArchiveResult, TaskDeleteResult, TaskMergeResult } from './types.js';
export { TaskLifecycleManager } from './lifecycle.js';
export { TaskAIManager, createTaskAIManager } from './ai.js';
export type { TaskAIManagerConfig } from './ai.js';
//# sourceMappingURL=index.d.ts.map