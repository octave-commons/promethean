/**
 * Task creation action for Kanban system
 * Extracted from kanban.ts to fix hanging bug and improve organization
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { Task, Board, ColumnData } from '../../types.js';
import { debug } from '../../utils/logger.js';
import { processTemplateContent } from '../../serializers/template-serializer.js';

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
import { sanitizeFileNameBase, generateAutoLabels } from '../../utils/string-utils.js';
import { NOW_ISO, BLOCKED_BY_HEADING, BLOCKS_HEADING } from '../../core/constants.js';
import { ensureUniqueFileBase, ensureTaskFileBase } from '../../core/slugs.js';
import { readTasksFolder } from './read-tasks-folder.js';
import {
  ensureSectionExists,
  setSectionItems,
  mergeSectionItems,
} from '../../serializers/markdown-serializer.js';
import { uniqueStrings, wikiLinkForTask, ensureTaskContent } from '../../utils/task-content.js';
import {
  writeBoard,
  maybeRefreshIndex,
  ensureColumn as ensureBoardColumn,
} from '../../serializers/board.js';
import { toFrontmatter } from '../../serializers/task-frontmatter.js';

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
  const validStartingStatuses = [
    'icebox',
    'incoming',
    'ready',
    'todo',
    'in_progress',
    'testing',
    'done',
  ];
  if (!validStartingStatuses.includes(column.toLowerCase())) {
    throw new Error(
      `Invalid starting status: ${column}. Must be one of: ${validStartingStatuses.join(', ')}`,
    );
  }
};

const ensureColumn = (board: Board, column: string): ColumnData => {
  const ensured = ensureBoardColumn(board, column);
  return ensured;
};

const createBaseTask = (
  title: string,
  column: ColumnData,
  input: CreateTaskInput,
  uuid: string,
  content: string,
): Task => ({
  uuid,
  title,
  status: column.name,
  priority: input.priority,
  labels: input.labels && input.labels.length > 0 ? [...input.labels] : undefined,
  created_at: input.created_at ?? NOW_ISO(),
  estimates: input.estimates ? { ...input.estimates } : {},
  content,
  slug: input.slug ? sanitizeFileNameBase(input.slug) : undefined,
});

export const createTaskAction = async (config: TaskCreationConfig): Promise<TaskCreationResult> => {
  const { board, column, input, tasksDir, boardPath } = config;

  console.log('*** createTaskAction called! ***');
  console.log('*** createTask params:', { column, title: input.title }, '***');
  debug('createTask function started');
  debug('createTask params:', { column, title: input.title });

  validateStartingStatus(column);

  const targetColumn = ensureColumn(board, column);

  const existingTasks = await readTasksFolder({ tasksPath: tasksDir });
  const existingById = new Map(existingTasks.map((task) => [task.uuid, task]));

  const uuid = input.uuid ?? randomUUID();
  const baseTitle = input.title?.trim() ?? '';
  const title = baseTitle.length > 0 ? baseTitle : `Task ${uuid.slice(0, 8)}`;
  const normalizedTitle = title.trim().toLowerCase();
  const targetColumnName = targetColumn.name.trim().toLowerCase();

  const existingTaskInFiles = existingTasks.find(
    (task) =>
      task.title.trim().toLowerCase() === normalizedTitle &&
      task.status.trim().toLowerCase() === targetColumnName,
  );
  if (existingTaskInFiles) {
    return { task: existingTaskInFiles, board };
  }

  const boardTaskInColumn = targetColumn.tasks.find(
    (task) => task.title.trim().toLowerCase() === normalizedTitle,
  );
  if (boardTaskInColumn) {
    const fullTask = existingTasks.find((task) => task.uuid === boardTaskInColumn.uuid);
    return { task: fullTask ?? boardTaskInColumn, board };
  }

  const boardIndex = new Map<string, { column: ColumnData; index: number; task: Task }>();
  board.columns.forEach((col) =>
    col.tasks.forEach((task, index) => boardIndex.set(task.uuid, { column: col, index, task })),
  );

  const bodyText = input.body ?? input.content ?? '';
  const contentFromTemplate = await processTemplateContent({
    templatePath: input.templatePath,
    defaultTemplatePath: input.defaultTemplatePath,
    title,
    body: bodyText,
    uuid,
  });

  const taskContent1 = ensureSectionExists(contentFromTemplate, BLOCKED_BY_HEADING);
  const taskContent2 = ensureSectionExists(taskContent1, BLOCKS_HEADING);

  const baseTask = createBaseTask(title, targetColumn, input, uuid, taskContent2);

  const usedSlugs = new Map<string, string>();
  board.columns.forEach((col) => {
    col.tasks.forEach((task) => {
      const slug = ensureTaskFileBase({ ...task });
      usedSlugs.set(slug, task.uuid);
    });
  });

  const baseSlug = ensureTaskFileBase({ ...baseTask });
  const uniqueSlug = ensureUniqueFileBase(baseSlug, usedSlugs, baseTask.uuid);
  const taskWithSlug: Task = { ...baseTask, slug: uniqueSlug };
  usedSlugs.set(uniqueSlug, taskWithSlug.uuid);

  const blockingIds = uniqueStrings(input.blocking);
  const blockedByIds = uniqueStrings(input.blockedBy);

  const resolveBoardTask = (id: string): Task | undefined => {
    const entry = boardIndex.get(id);
    if (!entry) return existingById.get(id);
    const fallback = existingById.get(id);
    entry.task.content = ensureTaskContent(entry.task, fallback);
    return entry.task;
  };

  const blockingLinks: string[] = [];
  for (const id of blockingIds) {
    const target = resolveBoardTask(id);
    if (!target) continue;
    blockingLinks.push(wikiLinkForTask(target));
  }

  const blockedByLinks: string[] = [];
  for (const id of blockedByIds) {
    const target = resolveBoardTask(id);
    if (!target) continue;
    blockedByLinks.push(wikiLinkForTask(target));
  }

  const taskContent3 = setSectionItems(taskContent2, BLOCKED_BY_HEADING, blockedByLinks);
  const taskContent = setSectionItems(taskContent3, BLOCKS_HEADING, blockingLinks);

  const enrichedTask: Task = {
    ...taskWithSlug,
    content: taskContent,
    labels:
      taskWithSlug.labels && taskWithSlug.labels.length > 0
        ? [...taskWithSlug.labels]
        : [...generateAutoLabels(title, bodyText, 4)],
  };

  const newTaskLink = wikiLinkForTask(enrichedTask);

  const updateLinkedTask = async (id: string, heading: string) => {
    const entry = boardIndex.get(id);
    if (entry) {
      const fallback = existingById.get(id);
      const updatedContent = mergeSectionItems(ensureTaskContent(entry.task, fallback), heading, [
        newTaskLink,
      ]);
      const nextTask: Task = {
        ...entry.task,
        content: updatedContent,
      };
      entry.column.tasks = [
        ...entry.column.tasks.slice(0, entry.index),
        nextTask,
        ...entry.column.tasks.slice(entry.index + 1),
      ];
      entry.column.count = entry.column.tasks.length;
      boardIndex.set(id, {
        column: entry.column,
        index: entry.index,
        task: nextTask,
      });

      // Write the updated task to file
      if (nextTask.sourcePath) {
        await fs.writeFile(
          nextTask.sourcePath,
          toFrontmatter({ ...nextTask, status: nextTask.status ?? 'Todo' }),
          'utf8',
        );
      }
      return;
    }

    const existing = existingById.get(id);
    if (!existing?.sourcePath) return;
    const updatedContent = mergeSectionItems(ensureTaskContent(existing, existing), heading, [
      newTaskLink,
    ]);
    const nextTask: Task = {
      ...existing,
      content: updatedContent,
    };
    await fs.writeFile(
      existing.sourcePath,
      toFrontmatter({ ...nextTask, status: nextTask.status ?? 'Todo' }),
      'utf8',
    );
    existingById.set(id, nextTask);
  };

  for (const id of blockingIds) {
    await updateLinkedTask(id, BLOCKED_BY_HEADING);
  }

  for (const id of blockedByIds) {
    await updateLinkedTask(id, BLOCKS_HEADING);
  }

  await fs.mkdir(tasksDir, { recursive: true }).catch(() => {});
  const taskFilePath = path.join(tasksDir, `${enrichedTask.slug ?? enrichedTask.uuid}.md`);
  await fs.writeFile(taskFilePath, toFrontmatter(enrichedTask), 'utf8');

  const persistedTask: Task = { ...enrichedTask, sourcePath: taskFilePath };

  targetColumn.tasks = [...targetColumn.tasks, persistedTask];
  targetColumn.count = targetColumn.tasks.length;

  // Debug logging before writeBoard

  await writeBoard(boardPath, board);
  await maybeRefreshIndex(tasksDir);

  debug('Task created successfully:', enrichedTask.uuid);

  return { task: persistedTask, board };
};
