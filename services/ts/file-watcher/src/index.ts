import { spawn } from "child_process";
import chokidar from "chokidar";
import { dirname, join, resolve } from "path";
import { readFile as fsReadFile, writeFile as fsWriteFile } from "fs/promises";
import { MongoClient, Collection } from "mongodb";
import { io, Socket } from "socket.io-client";
import crypto from "crypto";
import { AGENT_NAME } from "../../../../shared/js/env.js";

/**
 * Options for {@link startFileWatcher} allowing injection of dependencies for testing.
 */
export interface FileWatcherOptions {
  /** Root of the repository. Defaults to the REPO_ROOT env var or "". */
  repoRoot?: string;
  /** Function used to execute python scripts. */
  runPython?: (
    script: string,
    capture?: boolean,
    args?: string[],
  ) => Promise<string | void>;
  /** Function used to write the kanban board file. */
  writeFile?: (path: string, data: string) => Promise<void>;
  /** Mongo collection for projecting board state. */
  mongoCollection?: Collection<any>;
  /** Socket instance used to emit board events. */
  socket?: Pick<Socket, "emit">;
  /** Skip initial kanban parse when true. */
  initialParse?: boolean;
}

const defaultRepoRoot = process.env.REPO_ROOT || "";

function defaultRunPython(
  script: string,
  capture = false,
  args: string[] = [],
): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [script, ...args], { cwd: defaultRepoRoot });
    let data = "";

    proc.stdout.on("data", (chunk) => {
      if (capture) {
        data += chunk.toString();
      } else {
        process.stdout.write(chunk);
      }
    });
    proc.stderr.on("data", (chunk) => process.stderr.write(chunk));
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(capture ? data : undefined);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Start the file watcher which keeps the kanban board and task files in sync.
 *
 * The watcher debounces changes it makes itself to avoid infinite loops. Only
 * user initiated changes trigger updates.
 */
export function startFileWatcher(options: FileWatcherOptions = {}): {
  boardWatcher: chokidar.FSWatcher;
  tasksWatcher: chokidar.FSWatcher;
} {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const runPython = options.runPython ?? defaultRunPython;
  const writeFile = options.writeFile ?? fsWriteFile;

  const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");
  const boardDir = dirname(boardPath);

  const mongoCollection =
    options.mongoCollection ??
    (() => {
      const client = new MongoClient(
        process.env.MONGODB_URI || "mongodb://localhost:27017",
      );
      client
        .connect()
        .catch((err) => console.error("mongo connect failed", err));
      return client.db("database").collection(`${AGENT_NAME}_kanban`);
    })();

  const socket =
    options.socket ?? io(process.env.SOCKET_URL || "http://localhost:3000");
  const initialParse = options.initialParse ?? true;

  let previousState: Record<string, KanbanCard> = {};

  let updatingBoard = false;
  let updatingTasks = false;

  interface KanbanCard {
    id: string;
    title: string;
    column: string;
    link: string;
  }

  async function processKanban(emit = true) {
    const text = await fsReadFile(boardPath, "utf8");
    const lines = text.split(/\r?\n/);
    let currentColumn = "";
    let boardModified = false;
    const cards: KanbanCard[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.startsWith("## ")) {
        currentColumn = line.slice(3).trim();
        continue;
      }
      const match = line.match(/^\-\s*\[[ xX]\]\s*(.*)$/);
      if (!match) continue;
      const rest = match[1]!;
      const linkMatch = rest.match(/\[(.*?)\]\((.*?)\)/);
      let title = rest.trim();
      let link: string | undefined;
      if (linkMatch) {
        title = linkMatch[1]!.trim();
        link = linkMatch[2]!;
      }
      let filePath: string | undefined;
      if (link) {
        link = link.replace(/\\/g, "/");
        filePath = resolve(boardDir, link);
      }
      let id = "";
      if (!filePath) {
        // create new task file
        id = crypto.randomUUID();
        const filename = `${title.replace(/[<>:\"/\\|?*]/g, "-")}.md`;
        filePath = join(tasksPath, filename);
        await fsWriteFile(filePath, `id: ${id}\n`);
        const rel = join("..", "tasks", encodeURI(filename)).replace(
          /\\/g,
          "/",
        );
        lines[i] = `- [ ] [${title}](${rel})`;
        link = rel;
        boardModified = true;
        updatingTasks = true;
      }
      let content = "";
      try {
        content = await fsReadFile(filePath, "utf8");
      } catch {
        content = "";
      }
      const idMatch = content.match(/^id:\s*(.+)$/m);
      if (idMatch) {
        id = idMatch[1]!.trim();
      } else {
        if (!id) id = crypto.randomUUID();
        content = `id: ${id}\n${content}`;
        await fsWriteFile(filePath, content);
        updatingTasks = true;
      }
      const card: KanbanCard = {
        id,
        title,
        column: currentColumn,
        link: link!,
      };
      cards.push(card);
    }

    if (boardModified) {
      updatingBoard = true;
      await writeFile(boardPath, lines.join("\n"));
      setTimeout(() => {
        updatingBoard = false;
      }, 100);
    }
    if (updatingTasks) {
      setTimeout(() => {
        updatingTasks = false;
      }, 100);
    }

    const currentState: Record<string, KanbanCard> = {};
    for (const card of cards) {
      currentState[card.id] = card;
      await mongoCollection.updateOne(
        { id: card.id },
        { $set: card },
        { upsert: true },
      );
      if (emit) {
        const prev = previousState[card.id];
        if (!prev) {
          socket.emit("kanban:cardCreated", card);
        } else {
          if (prev.column !== card.column) {
            socket.emit("kanban:cardMoved", {
              id: card.id,
              from: prev.column,
              to: card.column,
            });
          }
          if (prev.title !== card.title) {
            socket.emit("kanban:cardRenamed", {
              id: card.id,
              from: prev.title,
              to: card.title,
            });
          }
          if (prev.link !== card.link) {
            socket.emit("kanban:cardTaskChanged", {
              id: card.id,
              from: prev.link,
              to: card.link,
            });
          }
        }
      }
    }
    previousState = currentState;
  }

  async function updateFromBoard() {
    try {
      updatingTasks = true;
      await runPython(join("scripts", "kanban_to_hashtags.py"));
      await processKanban();
    } catch (err) {
      console.error("kanban_to_hashtags failed", err);
    } finally {
      setTimeout(() => {
        updatingTasks = false;
      }, 100);
    }
  }

  async function updateBoard() {
    try {
      updatingBoard = true;
      const output = await runPython(
        join("scripts", "hashtags_to_kanban.py"),
        true,
      );
      if (typeof output === "string") {
        await writeFile(boardPath, output);
      }
    } catch (err) {
      console.error("hashtags_to_kanban failed", err);
    } finally {
      setTimeout(() => {
        updatingBoard = false;
      }, 100);
    }
  }

  const boardWatcher = chokidar.watch(boardPath, { ignoreInitial: true });
  boardWatcher.on("change", () => {
    if (updatingBoard) {
      console.log("Ignoring board change triggered by watcher");
      return;
    }
    console.log("Board changed, syncing hashtags...");
    updateFromBoard();
  });

  const tasksWatcher = chokidar.watch(tasksPath, { ignoreInitial: true });
  tasksWatcher.on("add", (path) => {
    if (updatingTasks) {
      console.log("Ignoring task addition triggered by watcher");
      return;
    }
    console.log("New task file added, populating stub...");
    updatingTasks = true;
    runPython(join("scripts", "populate_task_ollama.py"), false, [path])
      .then(() => updateBoard())
      .catch((err) => console.error("populate_task_ollama failed", err))
      .finally(() => {
        setTimeout(() => {
          updatingTasks = false;
        }, 100);
      });
  });
  tasksWatcher.on("change", () => {
    if (updatingTasks) {
      console.log("Ignoring task change triggered by watcher");
      return;
    }
    console.log("Task file changed, regenerating board...");
    updateBoard();
  });
  if (initialParse) {
    processKanban(false).catch((err) =>
      console.error("initial kanban parse failed", err),
    );
  }

  return { boardWatcher, tasksWatcher };
}

if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      const repoRoot = defaultRepoRoot || process.cwd();
      const { HeartbeatClient } = await import(
        join(repoRoot, "shared", "js", "heartbeat", "index.js")
      );
      const hb = new HeartbeatClient();
      await hb.sendOnce();
      hb.start();
      startFileWatcher();
      console.log("File watcher running...");
    } catch (err) {
      console.error("failed to register heartbeat", err);
      process.exit(1);
    }
  })();
}
