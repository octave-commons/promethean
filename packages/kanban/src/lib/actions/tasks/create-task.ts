/**
 * Task creation action for Kanban system
 * Extracted from kanban.ts to fix hanging bug and improve organization
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { Task, Board, ColumnData } from '../../types.js';
import { debug } from '../../utils/logger.js';

export type CreateTaskInput = {
  title: string;
  content?: string;
  body?: string;
  labels?: string[];
  priority?: Task['priority'];
  estimates?: Task['estimates'];
  created_at?: string;
  uuid?: string;
  slug?: string;
  templatePath?: string;
  defaultTemplatePath?: string;
  blocking?: string[];
  blockedBy?: string[];
};
import { processTemplateContent } from '../../serializers/template-serializer.js';
import { sanitizeFileNameBase, generateAutoLabels } from '../../utils/string-utils.js';
import { NOW_ISO, BLOCKED_BY_HEADING, BLOCKS_HEADING } from '../../core/constants.js';
import { readTasksFolder } from './read-tasks-folder.js';
import {
  applyTemplateReplacements,
  ensureSectionExists,
  setSectionItems,
  mergeSectionItems,
} from '../../serializers/markdown-serializer.js';
import { uniqueStrings, wikiLinkForTask, ensureTaskContent } from '../../utils/task-content.ts';
import { writeBoard, maybeRefreshIndex, ensureColumn as ensureBoardColumn } from '../../serializers/board.ts';
import { toFrontmatter } from '../../serializers/task-frontmatter.ts';
import { locateTask } from '../../core/task-utils.ts';

interface TaskCreationConfig {
  readonly board: Board;
  readonly column: string;
  readonly input: CreateTaskInput;
  readonly tasksDir: string;
  readonly boardPath: string;
}

interface TaskCreationResult {
  readonly task: Task;
  readonly board: Board;
}

const validateStartingStatus = (column: string): void => {
  const validStartingStatuses = ['ready', 'todo', 'in_progress', 'testing', 'done'];
  if (!validStartingStatuses.includes(column.toLowerCase())) {
    throw new Error(
      `Invalid starting status: ${column}. Must be one of: ${validStartingStatuses.join(', ')}`,
    );
  }
};

const ensureColumn = (board: Board, column: string): ColumnData => {
  const targetColumn = board.columns.find((col) => col.name.toLowerCase() === column.toLowerCase());

  if (!targetColumn) {
    throw new Error(`Column not found: ${column}`);
  }

  return targetColumn;
};

// Duplicate checking temporarily disabled to focus on hanging bug fix
// TODO: Re-implement proper duplicate checking after hanging bug is resolved
// const checkForDuplicateTask = (
//   existingTasks: readonly Task[],
//   targetColumn: ColumnData,
//   normalizedTitle: string,
// ): Task | undefined => {
//   // First check: Look for existing task in files
//   const existingTaskInColumn = existingTasks.find(
//     (task) =>
//       task.title.trim().toLowerCase() === normalizedTitle &&
//       task.status.trim().toLowerCase() === targetColumn.name.trim().toLowerCase(),
//   );

//   if (existingTaskInColumn) {
//     return existingTaskInColumn;
//   }

//   // Second check: Look for existing task in target column on board
//   const boardTaskInColumn = targetColumn.tasks.find(
//     (task) => task.title.trim().toLowerCase() === normalizedTitle,
//   );

//   if (boardTaskInColumn) {
//     const fullTask = existingTasks.find((t) => t.uuid === boardTaskInColumn.uuid);
//     return fullTask || boardTaskInColumn;
//   }

//   return undefined;
// };

interface TaskData {
  readonly uuid: string;
  readonly title: string;
  readonly targetColumn: ColumnData;
  readonly input: CreateTaskInput;
  readonly content: string;
}

const createBaseTask = (taskData: TaskData): Task => {
  const { uuid, title, targetColumn, input, content } = taskData;

  const taskLabels = input.labels && input.labels.length > 0 ? [...input.labels] : undefined;
  const taskEstimates = input.estimates ? { ...input.estimates } : undefined;
  const taskSlug = input.slug ? sanitizeFileNameBase(input.slug) : undefined;

  return {
    uuid,
    title,
    status: targetColumn.name,
    priority: input.priority,
    labels: taskLabels,
    created_at: input.created_at ?? NOW_ISO(),
    estimates: taskEstimates,
    content,
    slug: taskSlug,
  };
};

const generateUniqueSlug = (baseTask: Task, board: Board): string => {
  const usedSlugs: Record<string, string> = board.columns.reduce(
    (acc, col) => ({
      ...acc,
      ...col.tasks.reduce(
        (taskAcc, task) => (task.slug ? { ...taskAcc, [task.slug]: task.uuid } : taskAcc),
        {},
      ),
    }),
    {},
  );

  const baseSlug = baseTask.slug || sanitizeFileNameBase(baseTask.title);

  const generateSlug = (slug: string, counter: number): string => {
    const candidate = counter > 1 ? `${baseSlug}-${counter}` : slug;
    return usedSlugs[candidate] && usedSlugs[candidate] !== baseTask.uuid
      ? generateSlug(slug, counter + 1)
      : candidate;
  };

  return generateSlug(baseSlug, 1);
};

const processTaskContent = async (
  input: CreateTaskInput,
  title: string,
  uuid: string,
): Promise<string> => {
  const templateConfig = {
    templatePath: input.templatePath,
    defaultTemplatePath: input.defaultTemplatePath,
    title,
    body: input.body ?? input.content ?? '',
    uuid,
  };

  return await processTemplateContent(templateConfig);
};

interface TaskData {
  readonly uuid: string;
  readonly title: string;
  readonly input: CreateTaskInput;
}

const prepareTaskData = (input: CreateTaskInput): TaskData => {
  const uuid = input.uuid ?? randomUUID();
  const baseTitle = input.title?.trim() ?? '';
  const title = baseTitle.length > 0 ? baseTitle : `Task ${uuid.slice(0, 8)}`;

  return {
    uuid,
    title,
    input: { ...input, uuid },
    targetColumn: {} as ColumnData, // Will be set later
    content: '', // Will be set later
  };
};

const createFinalTask = (
  taskData: TaskData,
  targetColumn: ColumnData,
  board: Board,
  content: string,
): Task => {
  const { uuid, title, input } = taskData;

  const baseTask = createBaseTask({ uuid, title, targetColumn, input, content });
  const uniqueSlug = generateUniqueSlug(baseTask, board);
  const taskWithSlug = { ...baseTask, slug: uniqueSlug };

  const autoLabels = [...generateAutoLabels(title, input.body, 4)];
  return {
    ...taskWithSlug,
    labels: taskWithSlug.labels ? [...taskWithSlug.labels] : autoLabels,
  };
};

const updateBoardWithTask = (board: Board, targetColumn: ColumnData, finalTask: Task): Board => ({
  ...board,
  columns: board.columns.map((col) =>
    col.name === targetColumn.name
      ? {
          ...col,
          tasks: [...col.tasks, finalTask],
          count: col.tasks.length + 1,
        }
      : col,
  ),
});

/**
 * Create a new task in specified column
 */
export const createTaskAction = async (config: TaskCreationConfig): Promise<TaskCreationResult> => {
  const { board, column, input } = config;

  debug('createTask function started');
  debug('createTask params:', { column, title: input.title });

  // Validate that starting status is allowed
  validateStartingStatus(column);
  const targetColumn = ensureColumn(board, column);

  // Prepare task data
  const taskData = prepareTaskData(input);
  debug('UUID generated:', taskData.uuid.slice(0, 8));

  // Process task content with timeout protection
  const content = await processTaskContent(taskData.input, taskData.title, taskData.uuid);

  // Create final task
  const finalTask = createFinalTask(taskData, targetColumn, board, content);

  // Update board
  const updatedBoard = updateBoardWithTask(board, targetColumn, finalTask);

  debug('Task created successfully:', finalTask.uuid);

  return { task: finalTask, board: updatedBoard };
};
