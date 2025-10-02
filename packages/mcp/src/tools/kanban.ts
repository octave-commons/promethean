import path from "node:path";

import { z } from "zod";
import { loadKanbanConfig } from "@promethean/kanban/dist/board/config.js";
import {
  loadBoard,
  getColumn,
  findTaskById,
  findTaskByTitle,
  updateStatus,
  moveTask,
  syncBoardAndTasks,
  searchTasks,
} from "@promethean/kanban/dist/lib/kanban.js";
import type { Board } from "@promethean/kanban/dist/lib/types.js";

import type { ToolFactory } from "../core/types.js";

type PathOverrides = Readonly<{
  boardFile?: string;
  tasksDir?: string;
}>;

type KanbanPaths = Readonly<{
  boardFile: string;
  tasksDir: string;
}>;

const normalizePath = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") return undefined;
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
    name: "kanban.get-board",
    description:
      "Load the kanban board defined by the repository configuration.",
    inputSchema: basePathSchema,
  } as const;

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
    name: "kanban.get-column",
    description: "Fetch a single column and its tasks from the kanban board.",
    inputSchema: {
      ...basePathSchema,
      column: z.string(),
    },
  } as const;

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
    name: "kanban.find-task",
    description: "Find a task on the kanban board by its UUID.",
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
    },
  } as const;

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
    name: "kanban.find-task-by-title",
    description: "Find a task by exact title match on the kanban board.",
    inputSchema: {
      ...basePathSchema,
      title: z.string().min(1),
    },
  } as const;

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
    name: "kanban.update-status",
    description:
      "Move a task to a new column by updating its status and persisting the board.",
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      status: z.string().min(1),
    },
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (
      (await updateStatus(board, args.uuid, args.status, paths.boardFile)) ??
      null
    );
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
    name: "kanban.move-task",
    description:
      "Reorder a task within its column by applying the provided rank delta.",
    inputSchema: {
      ...basePathSchema,
      uuid: z.string().min(1),
      delta: z.number().int().min(-100).max(100),
    },
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board, paths] = await loadBoardWithPaths(ctx.env, args);
    return (
      (await moveTask(board, args.uuid, args.delta, paths.boardFile)) ?? null
    );
  };

  return { spec, invoke };
};

export const kanbanSyncBoard: ToolFactory = (ctx) => {
  const Schema = z.object(basePathSchema);
  const spec = {
    name: "kanban.sync-board",
    description:
      "Pull updates from task files into the board and push board ordering back to task files.",
    inputSchema: basePathSchema,
  } as const;

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
    name: "kanban.search",
    description:
      "Search tasks on the kanban board for matches and related results.",
    inputSchema: {
      ...basePathSchema,
      query: z.string().min(1),
    },
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw ?? {});
    const [board] = await loadBoardWithPaths(ctx.env, args);
    return searchTasks(board, args.query);
  };

  return { spec, invoke };
};
