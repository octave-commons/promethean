/**
 * Task content editor
 * Handles task body updates and section-level modifications
 */
import { TaskSection, TaskBodyUpdateRequest, SectionUpdateRequest, TaskContentResult } from './types.js';
/**
 * Update entire task body content
 */
export declare function updateTaskBody(cache: any, request: TaskBodyUpdateRequest): Promise<TaskContentResult>;
/**
 * Update a specific section within a task
 */
export declare function updateTaskSection(cache: any, request: SectionUpdateRequest): Promise<TaskContentResult>;
/**
 * Get specific sections from a task
 */
export declare function getTaskSections(cache: any, taskUuid: string): Promise<TaskSection[]>;
/**
 * Get a specific section from a task
 */
export declare function getTaskSection(cache: any, taskUuid: string, sectionHeader: string): Promise<TaskSection | null>;
//# sourceMappingURL=editor.d.ts.map