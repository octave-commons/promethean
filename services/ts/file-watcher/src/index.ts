import { spawn } from "child_process";
import { basename, dirname, join, resolve } from "path";
import {
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  stat as fsStat,
} from "fs/promises";
import { MongoClient, Collection } from "mongodb";
import { io, Socket } from "socket.io-client";
import crypto from "crypto";
import { FileLocks } from "./file-lock.js";
import { createBoardWatcher } from "./board-watcher.js";
import { createTasksWatcher } from "./tasks-watcher.js";
import type chokidar from "chokidar";

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
  /** Function used to call the LLM service. */
  callLLM?: (
    prompt: string,
    context: { role: string; content: string }[],
  ) => Promise<string>;
  /** Function used to write the kanban board file. */
  writeFile?: (path: string, data: string) => Promise<void>;
  /** Function used to populate new task files using the LLM service. */
  populateTask?: (path: string) => Promise<void>;
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

async function defaultCallLLM(
  prompt: string,
  context: { role: string; content: string }[],
): Promise<string> {
  const fetchFn = (globalThis as any).fetch;
  const res = await fetchFn(
    process.env.LLM_URL || "http://localhost:5003/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context }),
    },
  );
  const data = await res.json();
  return data.reply as string;
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
  close: () => Promise<void>;
} {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const runPython = options.runPython ?? defaultRunPython;
  const writeFile = options.writeFile ?? fsWriteFile;
  const populateTask =
    options.populateTask ??
    (async (path: string) => {
      try {
        const info = await fsStat(path);
        if (info.size > 0) return;
      } catch {
        // ignore
      }
      const title = basename(path, ".md").replace(/_/g, " ");
      const llmUrl = process.env.LLM_URL || "http://localhost:8080/llm";
      const prompt =
        "You are an engineering assistant. Given a task title, produce a concise markdown task stub with headings for Goals, Requirements, and Subtasks.";
      try {
        const res = await fetch(`${llmUrl}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            context: [{ role: "user", content: `Title: ${title}` }],
          }),
        });
        if (!res.ok) {
          throw new Error(`LLM request failed with status ${res.status}`);
        }
        const data = (await res.json()) as { reply: string };
        let content = data.reply?.toString().trim() || "";
        if (!content.startsWith("#")) {
          content = `#Todo\n\n${content}`;
        }
        if (!content.endsWith("\n")) content += "\n";
        await writeFile(path, content);
      } catch (err) {
        console.error("populateTask failed", err);
      }
    });
  const callLLM = options.callLLM ?? defaultCallLLM;

  const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");
  const boardDir = dirname(boardPath);

  const agentName = process.env.AGENT_NAME || "";
  let mongoClient: MongoClient | undefined;
  const mongoCollection =
    options.mongoCollection ??
    (() => {
      mongoClient = new MongoClient(
        process.env.MONGODB_URI || "mongodb://localhost:27017",
      );
      mongoClient
        .connect()
        .catch((err) => console.error("mongo connect failed", err));
      return mongoClient.db("database").collection(`${agentName}_kanban`);
    })();

  const socket =
    options.socket ??
    (process.env.NODE_ENV === "test"
      ? ({ emit: () => {}, disconnect: () => {} } as any)
      : io(process.env.SOCKET_URL || "http://localhost:3000"));
  const initialParse = options.initialParse ?? true;

  let previousState: Record<string, KanbanCard> = {};
  const fileLocks = new FileLocks();

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
        fileLocks.lock(tasksPath);
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
        fileLocks.lock(tasksPath);
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
      fileLocks.lock(boardPath);
      await writeFile(boardPath, lines.join("\n"));
      fileLocks.unlockAfter(boardPath, 100);
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

  async function updateBoard() {
    try {
      fileLocks.lock(boardPath);
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
      fileLocks.unlockAfter(boardPath, 100);
    }
  }

  const boardWatcher = createBoardWatcher({
    boardPath,
    tasksPath,
    runPython,
    processKanban,
    fileLocks,
  });

  const tasksWatcher = createTasksWatcher({
    tasksPath,
    populateTask,
    updateBoard,
    fileLocks,
    callLLM,
  });

  if (initialParse) {
    processKanban(false).catch((err) =>
      console.error("initial kanban parse failed", err),
    );
  }

  return {
    boardWatcher,
    tasksWatcher,
    async close() {
      await Promise.all([
        boardWatcher.close(),
        tasksWatcher.close(),
        mongoClient ? mongoClient.close() : Promise.resolve(),
      ]);
      if (!options.socket && (socket as any)?.disconnect) {
        (socket as any).disconnect();
      }
    },
  };
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
