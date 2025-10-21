import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter as parseMarkdownFrontmatter } from '@promethean/markdown/frontmatter';
import type { Task } from '../types.js';
import type {
  TaskSection,
  TaskContentResult,
  TaskBodyUpdateRequest,
  SectionUpdateRequest,
  TaskValidationResult
} from './types.js';
import {
  parseTaskContent,
  validateTaskContent,
  analyzeTaskContent
} from './parser.js';
import {
  updateTaskSection,
  getTaskSections
} from './editor.js';
import { TaskLifecycleManager } from './lifecycle.js';

/**
 * Task Cache for efficient task file operations
 */
// export interface TaskCache {
  tasksDir: string;
  getTaskPath: (uuid: string) => Promise<string | null>;
  readTask: (uuid: string) => Promise<Task | null>;
  writeTask: (task: Task) => Promise<void>;
  backupTask: (uuid: string) => Promise<string | undefined>;
}

// export class FileBasedTaskCache implements TaskCache {
  constructor(public readonly tasksDir: string) {}

  async getTaskPath(uuid: string): Promise<string | null> {
    const files = await fs.readdir(this.tasksDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.md')) {
        const filePath = path.join(this.tasksDir, file.name);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = parseMarkdownFrontmatter(content);
        if (parsed.data?.uuid === uuid) {
          return filePath;
        }
      }
    }
    return null;
  }

  async readTask(uuid: string): Promise<Task | null> {
    const filePath = await this.getTaskPath(uuid);
    if (!filePath) return null;

    const content = await fs.readFile(filePath, 'utf8');
    const parsed = parseMarkdownFrontmatter(content);

    if (!parsed.data?.uuid) return null;

    return {
      uuid: parsed.data.uuid,
      title: parsed.data.title || '',
      status: parsed.data.status || 'todo',
      priority: parsed.data.priority,
      labels: parsed.data.labels || [],
      created_at: parsed.data.created_at || new Date().toISOString(),
      estimates: parsed.data.estimates || {},
      content: parsed.content || '',
      slug: parsed.data.slug,
      sourcePath: filePath,
    };
  }

  async writeTask(task: Task): Promise<void> {
    const filePath = task.sourcePath || await this.getTaskPath(task.uuid);
    if (!filePath) {
      throw new Error(`Cannot find file path for task ${task.uuid}`);
    }

    const frontmatter = {
      uuid: task.uuid,
      title: task.title,
      slug: task.slug,
      status: task.status,
      priority: task.priority,
      labels: task.labels,
      created_at: task.created_at,
      estimates: task.estimates,
    };

    const content = [
      '---',
      ...Object.entries(frontmatter).map(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => JSON.stringify(v)).join(', ')}]`;
        }
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      }).filter(Boolean),
      '---',
      '',
      task.content || ''
    ].join('\n');

    await fs.writeFile(filePath, content, 'utf8');
  }

  async backupTask(uuid: string): Promise<string | undefined> {
    const filePath = await this.getTaskPath(uuid);
    if (!filePath) return undefined;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;

    try {
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(`Failed to backup task ${uuid}:`, error);
      return undefined;
    }
  }
}

/**
 * High-level task content management operations
 */
// export class TaskContentManager {
  constructor(private readonly cache: TaskCache) {}

  /**
   * Read a task by UUID
   */
  async readTask(uuid: string): Promise<Task | null> {
    return await this.cache.readTask(uuid);
  }

  /**
   * Update the entire body content of a task
   */
  async updateTaskBody(request: TaskBodyUpdateRequest): Promise<TaskContentResult> {
    const { uuid, content, options = {} } = request;

    // Read current task
    const task = await this.cache.readTask(uuid);
    if (!task) {
      return {
        success: false,
        taskUuid: uuid,
        task: null,
        sections: [],
        validation: { valid: false, errors: [], warnings: [], suggestions: [] },
        error: `Task ${uuid} not found`
      };
    }

    // Create backup if requested
    let backupPath: string | undefined;
    if (options.createBackup) {
      backupPath = await this.cache.backupTask(uuid);
    }

    try {
      // Parse and validate new content
      const parsed = parseTaskContent(content);
      const validation = validateTaskContent(content);

      if (!validation.valid && options.validateStructure) {
        return {
          success: false,
          taskUuid: uuid,
          task,
          sections: parsed.sections,
          validation,
          backupPath,
          error: 'Content validation failed'
        };
      }

      // Update task with new content
      const updatedTask: Task = {
        ...task,
        content: parsed.body,
        // Update timestamp if requested
        ...(options.updateTimestamp ? {
          // Add timestamp to content or metadata as needed
        } : {})
      };

      // Write updated task
      await this.cache.writeTask(updatedTask);

      return {
        success: true,
        taskUuid: uuid,
        task: updatedTask,
        sections: parsed.sections,
        validation,
        backupPath
      };
    } catch (error) {
      return {
        success: false,
        taskUuid: uuid,
        task,
        sections: [],
        validation: { valid: false, errors: [String(error)], warnings: [], suggestions: [] },
        backupPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a specific section within a task
   */
  async updateTaskSection(request: SectionUpdateRequest): Promise<TaskContentResult> {
    const { taskUuid, options = {} } = request;

    // Read current task
    const task = await this.cache.readTask(taskUuid);
    if (!task) {
      return {
        success: false,
        taskUuid,
        task: null,
        sections: [],
        validation: { valid: false, errors: [], warnings: [], suggestions: [] },
        error: `Task ${taskUuid} not found`
      };
    }

    // Create backup if requested
    let backupPath: string | undefined;
    if (options.createBackup) {
      backupPath = await this.cache.backupTask(taskUuid);
    }

    try {
      // Update the section
      const result = await updateTaskSection(this.cache, request);

      if (!result.success) {
        return {
          success: false,
          taskUuid,
          task,
          sections: [],
          validation: { valid: false, errors: [result.error || 'Update failed'], warnings: [], suggestions: [] },
          backupPath,
          error: result.error || 'Failed to update section'
        };
      }

      return {
        success: true,
        taskUuid,
        task: result.task,
        sections: result.sections,
        validation: { valid: true, errors: [], warnings: [], suggestions: [] },
        backupPath
      };
    } catch (error) {
      return {
        success: false,
        taskUuid,
        task,
        sections: [],
        validation: { valid: false, errors: [String(error)], warnings: [], suggestions: [] },
        backupPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get sections of a task
   */
  async getTaskSections(uuid: string): Promise<TaskSection[]> {
    const task = await this.cache.readTask(uuid);
    if (!task || !task.content) {
      return [];
    }

    try {
      return await getTaskSections(this.cache, uuid);
    } catch (error) {
      console.error(`Failed to get sections for task ${uuid}:`, error);
      return [];
    }
  }

  /**
   * Analyze task content
   */
  async analyzeTaskContent(uuid: string): Promise<{
    sections: TaskSection[];
    validation: TaskValidationResult;
    analysis: any;
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number;
  } | null> {
    const task = await this.cache.readTask(uuid);
    if (!task || !task.content) {
      return null;
    }

    try {
      const parsed = parseTaskContent(task.content);
      const validation = validateTaskContent(task.content);
      const analysis = analyzeTaskContent(task.content);

      return {
        sections: parsed.sections,
        validation,
        analysis,
        wordCount: task.content.split(/\s+/).length,
        characterCount: task.content.length,
        estimatedReadingTime: Math.ceil(task.content.split(/\s+/).length / 200), // 200 WPM
      };
    } catch (error) {
      console.error(`Failed to analyze task ${uuid}:`, error);
      return null;
    }
  }
}

/**
 * Create a task lifecycle manager instance
 */
// export function createTaskLifecycleManager(
  contentManager: TaskContentManager,
  tasksDir: string,
  archiveDir?: string
): TaskLifecycleManager {
  return new TaskLifecycleManager(contentManager, tasksDir, archiveDir);
}

/**
 * Create a task content manager instance
 */
// export function createTaskContentManager(tasksDir: string): TaskContentManager {
  const cache = new FileBasedTaskCache(tasksDir);
  return new TaskContentManager(cache);
}

// Re-// export types for convenience
// export type {
  TaskSection,
  TaskContentResult,
  TaskBodyUpdateRequest,
  SectionUpdateRequest,
  TaskValidationResult,
  TaskArchiveRequest,
  TaskDeleteRequest,
  TaskMergeRequest,
  TaskLifecycleOptions,
  TaskArchiveResult,
  TaskDeleteResult,
  TaskMergeResult
} from './types.js';

// Re-// export lifecycle manager
// export { TaskLifecycleManager } from './lifecycle.js';

// Re-// export AI manager
// export { TaskAIManager, createTaskAIManager } from './ai.js';
// export type { TaskAIManagerConfig } from './ai.js';