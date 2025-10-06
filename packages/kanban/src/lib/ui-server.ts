import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { escapeHtml } from '../frontend/render.js';

import { loadBoard } from './kanban.js';
type Primitive = string | number | boolean | symbol | null | undefined | bigint;

type DeepReadonlyTuple<T extends ReadonlyArray<unknown>> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends (...args: infer A) => infer R
    ? (...args: DeepReadonlyTuple<A>) => DeepReadonly<R>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepReadonly<U>>
      : T extends object
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T;

type SummaryColumn = {
  readonly name: string;
  readonly count: number;
  readonly limit: number | null;
};

type KanbanSummary = {
  readonly totalTasks: number;
  readonly columns: ReadonlyArray<SummaryColumn>;
};

type KanbanBoardPayload = {
  readonly board: ReadonlyLoadedBoard;
  readonly generatedAt: string;
  readonly summary: KanbanSummary;
};

type KanbanUiServerOptions = {
  readonly boardFile: string;
  readonly tasksDir: string;
  readonly host?: string;
  readonly port?: number;
};

type ImmutableSummary = DeepReadonly<KanbanSummary>;

type ImmutablePayload = DeepReadonly<KanbanBoardPayload>;

type ImmutableOptions = DeepReadonly<KanbanUiServerOptions>;

type LoadedBoard = Awaited<ReturnType<typeof loadBoard>>;

type ReadonlyLoadedBoard = DeepReadonly<LoadedBoard>;

type HttpResponse = Readonly<
  Pick<ServerResponse, 'writeHead' | 'end'> &
    Partial<Pick<ServerResponse, 'setHeader' | 'getHeader'>>
>;

type HttpRequest = Readonly<Pick<IncomingMessage, 'method' | 'url'>>;

type ServerInstance = ReturnType<typeof createServer>;

type ServerControls = Readonly<
  Pick<ServerInstance, 'listen' | 'once' | 'off' | 'close' | 'address'>
>;

type FrontendAsset = Readonly<{
  readonly path: string;
  readonly contentType: string;
}>;

const createAssetDescriptor = (relativePath: string, contentType: string): FrontendAsset =>
  ({
    path: fileURLToPath(new URL(relativePath, import.meta.url)),
    contentType,
  }) satisfies FrontendAsset;

const FRONTEND_ASSETS: ReadonlyMap<string, FrontendAsset> = new Map([
  [
    '/assets/kanban-ui.js',
    createAssetDescriptor('../frontend/kanban-ui.js', 'application/javascript; charset=utf-8'),
  ],
  [
    '/assets/render.js',
    createAssetDescriptor('../frontend/render.js', 'application/javascript; charset=utf-8'),
  ],
  [
    '/assets/styles.js',
    createAssetDescriptor('../frontend/styles.js', 'application/javascript; charset=utf-8'),
  ],
]);

const computeSummary = (board: ReadonlyLoadedBoard): ImmutableSummary => {
  const columns = board.columns.map((column) => {
    const count = Number.isFinite(column.count) ? column.count : column.tasks.length;
    const limit =
      typeof column.limit === 'number' && Number.isFinite(column.limit) ? column.limit : null;
    return {
      name: column.name,
      count,
      limit,
    } satisfies SummaryColumn;
  });
  const totalTasks = columns.reduce((acc, column) => acc + column.count, 0);
  return { totalTasks, columns } satisfies ImmutableSummary;
};

const htmlTemplate = (options: ImmutableOptions): string => {
  const cwd = process.cwd();
  const boardPath = path.isAbsolute(options.boardFile)
    ? path.relative(cwd, options.boardFile) || options.boardFile
    : options.boardFile;
  const tasksPath = path.isAbsolute(options.tasksDir)
    ? path.relative(cwd, options.tasksDir) || options.tasksDir
    : options.tasksDir;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Promethean Kanban</title>
    <meta name="description" content="Workspace kanban dashboard" />
  </head>
  <body>
    <div
      id="kanban-root"
      data-board-path="${escapeHtml(boardPath)}"
      data-tasks-path="${escapeHtml(tasksPath)}"
    >
      <noscript>
        This dashboard requires JavaScript to render the kanban board.
      </noscript>
    </div>
    <script type="module" src="/assets/kanban-ui.js"></script>
  </body>
</html>`;
};

const send = (
  res: HttpResponse,
  status: number,
  body: string,
  headers?: Readonly<Record<string, string>>,
): void => {
  res.writeHead(status, {
    'Content-Length': Buffer.byteLength(body, 'utf8'),
    ...headers,
  });
  res.end(body, 'utf8');
};

const sendJson = (res: HttpResponse, status: number, payload: unknown): void => {
  const body = JSON.stringify(payload, null, 2);
  send(res, status, body, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
};

const notFound = (res: HttpResponse): void => {
  send(res, 404, 'Not Found', {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
};

const internalError = (res: HttpResponse, error: unknown): void => {
  console.error('[kanban-ui]', error);
  send(res, 500, 'Internal Server Error', {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
};

const readRequestBody = (req: HttpRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';

    const cleanup = () => {
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
    };

    const onError = (error: unknown) => {
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const onEnd = () => {
      cleanup();
      resolve(body);
    };

    const onData = (chunk: string) => {
      body += chunk;
      if (body.length > MAX_BODY_SIZE) {
        cleanup();
        reject(new RequestTooLargeError());
      }
    };

    req.setEncoding('utf8');
    req.on('data', onData);
    req.once('end', onEnd);
    req.once('error', onError);
  });

const handleBoardRequest = async (res: HttpResponse, options: ImmutableOptions): Promise<void> => {
  try {
    const board = await loadBoard(options.boardFile, options.tasksDir);
    const payload: ImmutablePayload = {
      board: board as ReadonlyLoadedBoard,
      generatedAt: new Date().toISOString(),
      summary: computeSummary(board as ReadonlyLoadedBoard),
    } satisfies ImmutablePayload;
    sendJson(res, 200, payload);
  } catch (error) {
    internalError(res, error);
  }
};

const handleScriptRequest = async (res: HttpResponse): Promise<void> => {
  try {
    const script = await readFile(FRONTEND_SCRIPT_PATH, 'utf8');
    send(res, 200, script, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    internalError(res, error);
  }
};

const handleActionsList = async (res: HttpResponse): Promise<void> => {
  const { REMOTE_COMMANDS } = await loadCommandModule();
  sendJson(res, 200, {
    ok: true,
    commands: [...REMOTE_COMMANDS],
    generatedAt: new Date().toISOString(),
  });
};

const handleActionRequest = async (
  req: HttpRequest,
  res: HttpResponse,
  options: ImmutableOptions,
): Promise<void> => {
  const {
    executeCommand,
    REMOTE_COMMANDS,
    CommandUsageError: UsageError,
    CommandNotFoundError: NotFoundError,
  } = await loadCommandModule();

  try {
    const rawBody = await readRequestBody(req);
    if (rawBody.trim().length === 0) {
      throw new UsageError('Action payload is required.');
    }

    const parsed = JSON.parse(rawBody) as Readonly<{
      command?: unknown;
      args?: unknown;
    }>;

    const command = parsed.command;
    if (typeof command !== 'string' || command.trim().length === 0) {
      throw new UsageError('Action "command" must be a non-empty string.');
    }

    if (!REMOTE_COMMANDS.includes(command)) {
      throw new UsageError(`Action "${command}" is not available via the HTTP API.`);
    }

    const argsSource = parsed.args;
    const args = Array.isArray(argsSource)
      ? argsSource.map((value, index) => {
          if (typeof value !== 'string') {
            throw new UsageError(
              `Action arguments must be strings (invalid value at index ${index}).`,
            );
          }
          return value;
        })
      : [];

    const context = { boardFile: options.boardFile, tasksDir: options.tasksDir };
    const result = await executeCommand(command, args, context);

    sendJson(res, 200, {
      ok: true,
      command,
      args,
      result: typeof result === 'undefined' ? null : result,
      executedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON body.' });
      return;
    }
    if (error instanceof RequestTooLargeError) {
      sendJson(res, 413, { ok: false, error: error.message });
      return;
    }
    if (error instanceof UsageError) {
      sendJson(res, 400, { ok: false, error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      sendJson(res, 404, { ok: false, error: error.message });
      return;
    }
    internalError(res, error);
  }
};

const routeRequest = async (
  req: HttpRequest,
  res: HttpResponse,
  options: ImmutableOptions,
): Promise<void> => {
  const method = req.method ?? 'GET';
  const url = req.url ?? '/';

  if (url === '/' || url.startsWith('/?')) {
    if (method !== 'GET') {
      notFound(res);
      return;
    }
    send(res, 200, htmlTemplate(options), {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    return;
  }

  if (url.startsWith('/api/board')) {
    if (method !== 'GET') {
      notFound(res);
      return;
    }
    await handleBoardRequest(res, options);
    return;
  }

  if (url.startsWith('/api/actions')) {
    if (method === 'GET') {
      await handleActionsList(res);
      return;
    }
    if (method === 'POST') {
      await handleActionRequest(req, res, options);
      return;
    }
    notFound(res);
    return;
  }

  if (url.startsWith('/assets/kanban-ui.js')) {
    if (method !== 'GET') {
      notFound(res);
      return;
    }
    await handleScriptRequest(res);
    return;
  }

  notFound(res);
};

export const createKanbanUiServer = (options: ImmutableOptions): ServerControls => {
  const server = createServer((req, res) => {
    void routeRequest(req, res, options);
  });

  return server;
};

export const serveKanbanUI = async (options: ImmutableOptions): Promise<void> => {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? 4173;
  const server = createKanbanUiServer(options);
  await new Promise<void>((resolve, reject) => {
    const removeSignalListeners = () => {
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
    };

    const onError = (error: Readonly<Error>) => {
      removeSignalListeners();
      server.close(() => {
        reject(error);
      });
    };

    const stop = () => {
      removeSignalListeners();
      server.close((closeError?: Readonly<Error> | null) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve();
      });
    };

    server.once('error', onError);

    server.listen(port, host, () => {
      console.log(`Kanban UI available at http://${host}:${port} (press Ctrl+C to stop)`);
    });

    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
};
