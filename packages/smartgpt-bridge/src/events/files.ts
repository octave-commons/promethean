import {
  FileTreeResult,
  flattenTreeToEntriesAction,
  scheduleReindexAction,
  treeDirectoryAction,
  viewFileAction,
  writeFileContentAction,
  writeFileLinesAction,
} from "../actions/files.js";

export class EventError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "EventError";
  }
}

export type EventResponse<T> = {
  status?: number;
  body: T;
};

type FilesEventArgs = {
  rootPath: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
};

type FilesReindexArgs = { body?: Record<string, unknown> };
type FilesWriteArgs = {
  rootPath: string;
  body?: Record<string, unknown>;
};

export async function onFilesRequestEvent({
  rootPath,
  query,
  params,
}: FilesEventArgs): Promise<EventResponse<any>> {
  const q = query ?? {};
  const wildcard = params?.["*"] ?? params?.path;
  const dir = wildcard ? String(wildcard) : String(q.path ?? ".");
  const hidden = String(q.hidden ?? "false").toLowerCase() === "true";
  const depthValue =
    typeof q.depth === "number" ? q.depth : Number(q.depth ?? 2);
  const depth = Number.isFinite(depthValue) ? depthValue : 2;
  const wantTree = String(q.tree ?? "false").toLowerCase() === "true";
  const lineValue = q.line !== undefined ? Number(q.line) : undefined;
  const line =
    lineValue !== undefined && Number.isFinite(lineValue)
      ? lineValue
      : undefined;
  const contextValue = q.context !== undefined ? Number(q.context) : undefined;
  const context =
    contextValue !== undefined && Number.isFinite(contextValue)
      ? contextValue
      : undefined;

  if (dir && dir !== ".") {
    try {
      const viewArgs: {
        rootPath: string;
        path: string;
        line?: number;
        context?: number;
      } = {
        rootPath,
        path: dir,
      };
      if (line !== undefined) viewArgs.line = line;
      if (context !== undefined) viewArgs.context = context;
      const info = await viewFileAction(viewArgs);
      return { body: { ok: true, ...info } };
    } catch (_err) {
      // fall back to directory listing below
    }
  }

  try {
    const treeResult = await treeDirectoryAction({
      rootPath,
      path: dir,
      includeHidden: hidden,
      depth,
    });
    if (!isFileTreeResult(treeResult)) {
      throw new EventError(500, "Invalid tree response");
    }
    if (wantTree) {
      return {
        body: { ok: true, base: treeResult.base, tree: treeResult.tree },
      };
    }
    const entries = flattenTreeToEntriesAction(treeResult.tree);
    return { body: { ok: true, base: treeResult.base, entries } };
  } catch (error) {
    const err = wrapError(error, 400);
    throw err;
  }
}

export async function onFilesReindexEvent({
  body,
}: FilesReindexArgs): Promise<EventResponse<any>> {
  const globs = body?.path;
  if (!globs) throw new EventError(400, "Missing 'path'");
  try {
    const result = await scheduleReindexAction(globs as string | string[]);
    return { body: result };
  } catch (error) {
    throw wrapError(error, 500);
  }
}

export async function onFilesWriteEvent({
  rootPath,
  body,
}: FilesWriteArgs): Promise<EventResponse<any>> {
  const filePath = body?.path;
  if (!filePath) throw new EventError(400, "Missing path");
  const content = body?.content;
  const lines = body?.lines;
  const startLine = body?.startLine;

  try {
    if (typeof content === "string") {
      await writeFileContentAction({
        rootPath,
        path: String(filePath),
        content,
      });
      return { body: { ok: true, path: String(filePath) } };
    }

    if (Array.isArray(lines) && typeof startLine === "number") {
      const normalizedLines = lines.map((lineValue) => String(lineValue));
      await writeFileLinesAction({
        rootPath,
        path: String(filePath),
        lines: normalizedLines,
        startLine,
      });
      return { body: { ok: true, path: String(filePath) } };
    }
  } catch (error) {
    throw wrapError(error, 400);
  }

  throw new EventError(400, "Must provide content or lines+startLine");
}

function wrapError(error: unknown, fallbackStatus: number) {
  if (error instanceof EventError) return error;
  const message =
    error instanceof Error ? error.message : "Unexpected event error";
  return new EventError(fallbackStatus, message);
}

function isFileTreeResult(value: unknown): value is FileTreeResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.ok === true &&
    typeof candidate.base === "string" &&
    typeof candidate.tree === "object"
  );
}
