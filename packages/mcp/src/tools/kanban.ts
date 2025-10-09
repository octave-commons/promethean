import path from 'node:path';

import { z } from 'zod';
import { loadKanbanConfig } from '@promethean/kanban/dist/board/config.js';
import {
  loadBoard,
  getColumn,
  findTaskById,
  findTaskByTitle,
  updateStatus,
  moveTask,
  syncBoardAndTasks,
  searchTasks,
  updateTaskDescription,
  renameTask,
  archiveTask,
  deleteTask,
  mergeTasks,
  analyzeTask,
  rewriteTask,
  breakdownTask,
} from '@promethean/kanban/dist/lib/kanban.js';
import type { Board } from '@promethean/kanban/dist/lib/types.js';

import type { ToolFactory, ToolSpec } from '../core/types.js';

type PathOverrides = Readonly<{
  boardFile?: string;
  tasksDir?: string;
}>;

type KanbanPaths = Readonly<{
  boardFile: string;
  tasksDir: string;
}>;

const normalizePath = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return path.resolve(trimmed);
};

const resolveKanbanPaths = async (
  env: Readonly<Record<string, string | undefined>>,
  overrides: PathOverrides,
): Promise<KanbanPaths> => {
  const boardOverride = normalizePath(overrides.boardFile);
  const tasksOverride = normalizePath(overrides.tasksDir);
  if (boardOverride && tasksOverride) {
    return { boardFile: boardOverride, tasksDir: tasksOverride };
  }

  const { config } = await loadKanbanConfig({ argv: [], env });
  return {
    boardFile: boardOverride ?? config.boardFile,
    tasksDir: tasksOverride ?? config.tasksDir,
  };
};

const loadBoardWithPaths = async (
  env: Readonly<Record<string, string | undefined>>,
  overrides: PathOverrides,
): Promise<readonly [Board, KanbanPaths]> => {
  const paths = await resolveKanbanPaths(env, overrides);
  const board = await loadBoard(paths.boardFile, paths.tasksDir);
  return [board, paths];
};

const basePathSchema = {
  boardFile: z.string().optional(),
  tasksDir: z.string().optional(),
} as const;

export const kanbanGetBoard: ToolFactory = (ctx) => {
  const Schema = z.object(basePathSchema);
  const spec = {
    name: 'kanban_get_board',
    description: 'Load the kanban board defined by the repository configuration.',
    inputSchema: basePathSchema,
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board] = await loadBoardWithPaths(ctx.env, args);
    return board;
  };

  return { spec, invoke };
};

export const kanbanGetColumn: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    column: z.string(),
  });
  const spec = {
    name: 'kanban_get_column',
    description: 'Fetch a single column and its tasks from the kanban board.',
    inputSchema: {
      ...basePathSchema,
      column: z.string(),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board] = await loadBoardWithPaths(ctx.env, args);
    return getColumn(board, args.column);
  };

  return { spec, invoke };
};

export const kanbanFindTaskById: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
  });
  const spec = {
    name: 'kanban_find_task',
    description: 'Find a task on the kanban board by its UUID.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board] = await loadBoardWithPaths(ctx.env, args);
    const task = findTaskById(board, args.uuid);
    return task ?? null;
  };

  return { spec, invoke };
};

export const kanbanFindTaskByTitle: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    title: z.string().min(1),
  });
  const spec = {
    name: 'kanban_find_task_by_title',
    description: 'Find a task by exact title match on the kanban board.',
    inputSchema: {
      ...basePathSchema,
      title: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board] = await loadBoardWithPaths(ctx.env, args);
    const task = findTaskByTitle(board, args.title);
    return task ?? null;
  };

  return { spec, invoke };
};

export const kanbanUpdateStatus: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
    status: z.string().min(1),
  });
  const spec = {
    name: 'kanban_update_status',
    description: 'Move a task to a new column by updating its status and persisting the board.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      status: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (await updateStatus(board, args.uuid, args.status, paths.boardFile)) ?? null;
  };

  return { spec, invoke };
};

export const kanbanMoveTask: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
    delta: z.number().int().min(-100).max(100),
  });
  const spec = {
    name: 'kanban_move_task',
    description: 'Reorder a task within its column by applying the provided rank delta.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      delta: z.number().int().min(-100).max(100),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (await moveTask(board, args.uuid, args.delta, paths.boardFile)) ?? null;
  };

  return { spec, invoke };
};

export const kanbanSyncBoard: ToolFactory = (ctx) => {
  const Schema = z.object(basePathSchema);
  const spec = {
    name: 'kanban_sync_board',
    description:
      'Pull updates from task files into the board and push board ordering back to task files.',
    inputSchema: basePathSchema,
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return syncBoardAndTasks(board, paths.tasksDir, paths.boardFile);
  };

  return { spec, invoke };
};

export const kanbanSearchTasks: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    query: z.string().min(1),
  });
  const spec = {
    name: 'kanban_search',
    description: 'Search tasks on the kanban board for matches and related results.',
    inputSchema: {
      ...basePathSchema,
      query: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board] = await loadBoardWithPaths(ctx.env, args);
    return searchTasks(board, args.query);
  };

  return { spec, invoke };
};

export const kanbanUpdateTaskDescription: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
    content: z.string().min(1),
  });
  const spec = {
    name: 'kanban_update_task_description',
    description: 'Update the description/content body of a task while preserving all other metadata.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      content: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (await updateTaskDescription(board, args.uuid, args.content, paths.tasksDir, paths.boardFile)) ?? null;
  };

  return { spec, invoke };
};

export const kanbanRenameTask: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
    title: z.string().min(1),
  });
  const spec = {
    name: 'kanban_rename_task',
    description: 'Update the title of a task while preserving all other metadata and content.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      title: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (await renameTask(board, args.uuid, args.title, paths.tasksDir, paths.boardFile)) ?? null;
  };

  return { spec, invoke };
};

export const kanbanArchiveTask: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
    columnName: z.string().optional(),
  });
  const spec = {
    name: 'kanban_archive_task',
    description: 'Move a task to an archive column (default: "Archive") for long-term storage.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      columnName: z.string().optional(),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (await archiveTask(board, args.uuid, paths.tasksDir, paths.boardFile, { columnName: args.columnName })) ?? null;
  };

  return { spec, invoke };
};

export const kanbanDeleteTask: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuid: z.string().min(1),
  });
  const spec = {
    name: 'kanban_delete_task',
    description: 'Permanently delete a task from the board and remove its task file. This action cannot be undone.',
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return await deleteTask(board, args.uuid, paths.tasksDir, paths.boardFile);
  };

  return { spec, invoke };
};

export const kanbanMergeTasks: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    sourceUuids: z.array(z.string().min(1)),
    targetUuid: z.string().min(1),
    mergeStrategy: z.enum(['append', 'combine', 'replace']).optional().default('append'),
    preserveSources: z.boolean().optional().default(true),
  });
  const spec = {
    name: 'kanban_merge_tasks',
    description: 'Merge multiple source tasks into a target task, combining their content.',
    inputSchema: {
      ...basePathSchema,
      sourceUuids: z.array(z.string().min(1)),
      targetUuid: z.string().min(1),
      mergeStrategy: z.enum(['append', 'combine', 'replace']).optional().default('append'),
      preserveSources: z.boolean().optional().default(true),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (await mergeTasks(board, args.sourceUuids, args.targetUuid, paths.tasksDir, paths.boardFile, {
      mergeStrategy: args.mergeStrategy,
      preserveSources: args.preserveSources,
    })) ?? null;
  };

  return { spec, invoke };
};

export const kanbanBulkArchive: ToolFactory = (ctx) => {
  const Schema = z.object({
    ...basePathSchema,
    uuids: z.array(z.string().min(1)),
    columnName: z.string().optional(),
  });
  const spec = {
    name: 'kanban_bulk_archive',
    description: 'Archive multiple tasks in a single operation.',
    inputSchema: {
      ...basePathSchema,
      uuids: z.array(z.string().min(1)),
      columnName: z.string().optional(),
    },
    stability: 'experimental',
    since: '0.1.0',
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    const results = [];

    for (const uuid of args.uuids) {
      const result = await archiveTask(board, uuid, paths.tasksDir, paths.boardFile, {
        columnName: args.columnName,
      });
      results.push(result ?? null);
    }

    return results;
  };

  return { spec, invoke };
};

/**
 * AI-Assisted Task Management Tools
 */

export const kanbanAnalyzeTask: ToolFactory = (ctx) => {
  const spec = {
    name: 'kanban_analyze_task',
    description: 'Analyze a task using AI to provide insights into quality, complexity, completeness, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        boardFile: {
          type: 'string',
          description: 'Path to the kanban board file'
        },
        uuid: {
          type: 'string',
          description: 'UUID of the task to analyze'
        },
        analysisType: {
          type: 'string',
          enum: ['quality', 'complexity', 'completeness', 'breakdown', 'prioritization'],
          description: 'Type of analysis to perform'
        },
        context: {
          type: 'object',
          description: 'Additional context for analysis',
          properties: {
            projectInfo: { type: 'string' },
            teamContext: { type: 'string' },
            deadlines: { type: 'array', items: { type: 'string' } },
            dependencies: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['boardFile', 'uuid', 'analysisType']
    }
  };

  const invoke = async (args: any) => {
    const [board, paths] = await loadBoardWithPaths(ctx.env, {
      boardFile: args.boardFile,
      tasksDir: undefined
    });
    const result = await analyzeTask(
      board,
      args.uuid,
      args.analysisType,
      paths.tasksDir,
      paths.boardFile,
      args.context
    );
    return result;
  };

  return { spec, invoke };
};

export const kanbanRewriteTask: ToolFactory = (ctx) => {
  const spec = {
    name: 'kanban_rewrite_task',
    description: 'Rewrite a task using AI to improve clarity, completeness, or target specific style',
    inputSchema: {
      type: 'object',
      properties: {
        boardFile: {
          type: 'string',
          description: 'Path to the kanban board file'
        },
        uuid: {
          type: 'string',
          description: 'UUID of the task to rewrite'
        },
        rewriteType: {
          type: 'string',
          enum: ['improve', 'simplify', 'expand', 'restructure', 'SMART'],
          description: 'Type of rewrite to perform'
        },
        improvements: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific improvements to make'
        },
        targetStyle: {
          type: 'string',
          description: 'Target writing style'
        },
        context: {
          type: 'object',
          description: 'Context for the rewrite',
          properties: {
            projectInfo: { type: 'string' },
            audience: { type: 'string' },
            tone: { type: 'string' }
          }
        },
        options: {
          type: 'object',
          description: 'Rewrite options',
          properties: {
            dryRun: { type: 'boolean' },
            createBackup: { type: 'boolean' }
          }
        }
      },
      required: ['boardFile', 'uuid', 'rewriteType']
    }
  };

  const invoke = async (args: any) => {
    const [board, paths] = await loadBoardWithPaths(ctx.env, {
      boardFile: args.boardFile,
      tasksDir: undefined
    });
    const result = await rewriteTask(
      board,
      args.uuid,
      args.rewriteType,
      paths.tasksDir,
      paths.boardFile,
      args.improvements,
      args.targetStyle,
      args.context,
      args.options
    );
    return result;
  };

  return { spec, invoke };
};

export const kanbanBreakdownTask: ToolFactory = (ctx) => {
  const spec = {
    name: 'kanban_breakdown_task',
    description: 'Break down a task into smaller, manageable subtasks using AI analysis',
    inputSchema: {
      type: 'object',
      properties: {
        boardFile: {
          type: 'string',
          description: 'Path to the kanban board file'
        },
        uuid: {
          type: 'string',
          description: 'UUID of the task to break down'
        },
        maxSubtasks: {
          type: 'number',
          description: 'Maximum number of subtasks to generate'
        },
        breakdownStyle: {
          type: 'string',
          enum: ['sequential', 'parallel', 'hierarchical'],
          description: 'Style of breakdown'
        },
        context: {
          type: 'object',
          description: 'Context for the breakdown',
          properties: {
            projectInfo: { type: 'string' },
            teamSize: { type: 'number' },
            sprintLength: { type: 'string' }
          }
        }
      },
      required: ['boardFile', 'uuid']
    }
  };

  const invoke = async (args: any) => {
    const [board, paths] = await loadBoardWithPaths(ctx.env, {
      boardFile: args.boardFile,
      tasksDir: undefined
    });
    const result = await breakdownTask(
      board,
      args.uuid,
      paths.tasksDir,
      paths.boardFile,
      args.maxSubtasks,
      args.breakdownStyle,
      args.context
    );
    return result;
  };

  return { spec, invoke };
};

