import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

import { escapeHtml } from "../frontend/render.js";

import { loadBoard } from "./kanban.js";
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
  Pick<ServerResponse, "writeHead" | "end"> &
    Partial<Pick<ServerResponse, "setHeader" | "getHeader">>
>;

type HttpRequest = Readonly<Pick<IncomingMessage, "method" | "url">>;

type ServerInstance = ReturnType<typeof createServer>;

type ServerControls = Readonly<
  Pick<ServerInstance, "listen" | "once" | "off" | "close" | "address">
>;

const FRONTEND_SCRIPT_PATH = fileURLToPath(
  new URL("../frontend/kanban-ui.js", import.meta.url),
);

const computeSummary = (board: ReadonlyLoadedBoard): ImmutableSummary => {
  const columns = board.columns.map((column) => {
    const count = Number.isFinite(column.count)
      ? column.count
      : column.tasks.length;
    const limit =
      typeof column.limit === "number" && Number.isFinite(column.limit)
        ? column.limit
        : null;
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
    "Content-Length": Buffer.byteLength(body, "utf8"),
    ...headers,
  });
  res.end(body, "utf8");
};

const sendJson = (
  res: HttpResponse,
  status: number,
  payload: unknown,
): void => {
  const body = JSON.stringify(payload, null, 2);
  send(res, status, body, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
};

const notFound = (res: HttpResponse): void => {
  send(res, 404, "Not Found", {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
};

const internalError = (res: HttpResponse, error: unknown): void => {
  console.error("[kanban-ui]", error);
  send(res, 500, "Internal Server Error", {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
};

const handleBoardRequest = (
  res: HttpResponse,
  options: ImmutableOptions,
): Promise<void> =>
  loadBoard(options.boardFile, options.tasksDir)
    .then((board) => {
      const payload: ImmutablePayload = {
        board: board as ReadonlyLoadedBoard,
        generatedAt: new Date().toISOString(),
        summary: computeSummary(board as ReadonlyLoadedBoard),
      } satisfies ImmutablePayload;
      sendJson(res, 200, payload);
    })
    .catch((error) => {
      internalError(res, error);
    });

const handleScriptRequest = (res: HttpResponse): Promise<void> =>
  readFile(FRONTEND_SCRIPT_PATH, "utf8")
    .then((script) => {
      send(res, 200, script, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      });
    })
    .catch((error) => {
      internalError(res, error);
    });

const routeRequest = (
  req: HttpRequest,
  res: HttpResponse,
  options: ImmutableOptions,
): void => {
  const method = req.method ?? "GET";
  const url = req.url ?? "/";
  if (method !== "GET") {
    notFound(res);
    return;
  }
  if (url === "/" || url.startsWith("/?")) {
    send(res, 200, htmlTemplate(options), {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return;
  }
  if (url.startsWith("/api/board")) {
    void handleBoardRequest(res, options);
    return;
  }
  if (url.startsWith("/assets/kanban-ui.js")) {
    void handleScriptRequest(res);
    return;
  }
  notFound(res);
};

export const createKanbanUiServer = (
  options: ImmutableOptions,
): ServerControls => {
  const server = createServer((req, res) => {
    routeRequest(req, res, options);
  });

  return server;
};

export const serveKanbanUI = async (
  options: ImmutableOptions,
): Promise<void> => {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4173;
  const server = createKanbanUiServer(options);
  await new Promise<void>((resolve, reject) => {
    const removeSignalListeners = () => {
      process.off("SIGINT", stop);
      process.off("SIGTERM", stop);
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

    server.once("error", onError);

    server.listen(port, host, () => {
      console.log(
        `Kanban UI available at http://${host}:${port} (press Ctrl+C to stop)`,
      );
    });

    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });
};
