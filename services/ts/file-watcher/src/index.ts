import { spawn } from "child_process";
import chokidar from "chokidar";
import { join } from "path";
import { writeFile as fsWriteFile } from "fs/promises";

/**
 * Options for {@link startFileWatcher} allowing injection of dependencies for testing.
 */
export interface FileWatcherOptions {
  /** Root of the repository. Defaults to the REPO_ROOT env var or "". */
  repoRoot?: string;
  /** Function used to execute python scripts. */
  runPython?: (script: string, capture?: boolean) => Promise<string | void>;
  /** Function used to write the kanban board file. */
  writeFile?: (path: string, data: string) => Promise<void>;
}

const defaultRepoRoot = process.env.REPO_ROOT || "";

function defaultRunPython(
  script: string,
  capture = false,
): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [script], { cwd: defaultRepoRoot });
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

  let updatingBoard = false;
  let updatingTasks = false;

  async function updateFromBoard() {
    try {
      updatingTasks = true;
      await runPython(join("scripts", "kanban_to_hashtags.py"));
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
  tasksWatcher.on("change", () => {
    if (updatingTasks) {
      console.log("Ignoring task change triggered by watcher");
      return;
    }
    console.log("Task file changed, regenerating board...");
    updateBoard();
  });

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
