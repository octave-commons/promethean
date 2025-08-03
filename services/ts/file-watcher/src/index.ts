import { spawn } from "child_process";
import chokidar from "chokidar";
import { join } from "path";
import { writeFile } from "fs/promises";
import { pathToFileURL } from "url";

const repoRoot = process.env.REPO_ROOT || "";

function runCommand(
  cmd: string,
  args: string[],
  capture = false,
): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: repoRoot });
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

function runPython(script: string, capture = false) {
  return runCommand("python", [script], capture);
}

export function getFormatCommand(file: string): [string, string[]] | null {
  if (file.endsWith(".py")) {
    return ["black", [file]];
  }
  if (/(\.)(js|ts|jsx|tsx|json|md)$/.test(file)) {
    return ["npx", ["prettier", "--write", file]];
  }
  return null;
}

async function updateFromBoard() {
  try {
    await runPython(join("scripts", "kanban_to_hashtags.py"));
  } catch (err) {
    console.error("kanban_to_hashtags failed", err);
  }
}

async function updateBoard() {
  try {
    const output = await runPython(
      join("scripts", "hashtags_to_kanban.py"),
      true,
    );
    const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
    if (typeof output === "string") {
      await writeFile(boardPath, output);
    }
  } catch (err) {
    console.error("hashtags_to_kanban failed", err);
  }
}

const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
const tasksPath = join(repoRoot, "docs", "agile", "tasks");

export function start() {
  chokidar.watch(boardPath, { ignoreInitial: true }).on("change", () => {
    console.log("Board changed, syncing hashtags...");
    updateFromBoard();
  });

  chokidar.watch(tasksPath, { ignoreInitial: true }).on("change", () => {
    console.log("Task file changed, regenerating board...");
    updateBoard();
  });

  chokidar
    .watch(["**/*.py", "**/*.{js,ts,jsx,tsx,json,md}"], {
      cwd: repoRoot,
      ignoreInitial: true,
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.git/**",
        "docs/agile/boards/kanban.md",
        "docs/agile/tasks/**",
      ],
    })
    .on("change", (file) => {
      const cmd = getFormatCommand(file);
      if (cmd) {
        console.log(`Formatting ${file}...`);
        runCommand(cmd[0], cmd[1]).catch((err) =>
          console.error("format failed", err),
        );
      }
    });

  console.log("File watcher running...");
}

if (process.argv[1]) {
  const mainModule = pathToFileURL(process.argv[1]).href;
  if (import.meta.url === mainModule) {
    start();
  }
}
