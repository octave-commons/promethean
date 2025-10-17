import { execFile } from "child_process";

import chokidar from "chokidar";

export type RepoWatcherOptions = {
  repoRoot: string;
  bridgeUrl: string;
  debounceMs?: number;
  authToken?: string; // Bearer token for SmartGPT Bridge
}

function defaultIgnored(pathRel: string) {
  // Quick coarse filter to reduce event volume; gitignore check will refine
  return (
    pathRel.includes("/.git/") ||
    pathRel.startsWith(".git/") ||
    pathRel.includes("/node_modules/") ||
    pathRel.startsWith("node_modules/") ||
    pathRel.includes("/dist/") ||
    pathRel.startsWith("dist/") ||
    pathRel.includes("/build/") ||
    pathRel.startsWith("build/") ||
    pathRel.includes("/.obsidian/") ||
    pathRel.startsWith(".obsidian/") ||
    pathRel.startsWith(".")
  );
}

export function checkGitIgnored(
  repoRoot: string,
  pathRel: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    try {
      const child = execFile(
        "git",
        ["check-ignore", "-q", "--no-index", "--stdin"],
        {
          cwd: repoRoot,
        },
      );
      child.stdin?.on("error", () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      });
      child.on("error", () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      });
      child.on("close", (code) => {
        if (!resolved) {
          resolved = true;
          resolve(code === 0);
        }
      });
      try {
        child.stdin?.write(pathRel + "\n");
        child.stdin?.end();
      } catch {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }
    } catch {
      resolve(false);
    }
  });
}

type TokenProvider = string | (() => Promise<string | undefined>) | undefined;

async function resolveToken(tp: TokenProvider): Promise<string | undefined> {
  if (!tp) return undefined;
  if (typeof tp === "string") return tp;
  try {
    return await tp();
  } catch {
    return undefined;
  }
}

async function postJSON(url: string, body: unknown, token: TokenProvider) {
  try {
    const t = await resolveToken(token);
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore transient errors; watcher will send again on next change
  }
}

export async function createRepoWatcher({
  repoRoot,
  bridgeUrl,
  debounceMs,
  authToken,
}: RepoWatcherOptions) {
  const DEBOUNCE_MS =
    typeof debounceMs === "number"
      ? debounceMs
      : Number(process.env.FILE_WATCHER_DEBOUNCE_MS || 2000);
  // Prefer dynamic token provider via auth-service if configured; fallback to static env token
  let TOKEN: TokenProvider = undefined;
  const { createTokenProviderFromEnv } = await import("./token-client.js");
  const provider = createTokenProviderFromEnv();
  if (provider) {
    TOKEN = provider;
  } else {
    TOKEN =
      authToken ||
      process.env.SMARTGPT_BRIDGE_TOKEN ||
      process.env.BRIDGE_AUTH_TOKEN ||
      process.env.AUTH_TOKEN ||
      "";
  }
  const watcher = chokidar.watch("**/*", {
    cwd: repoRoot,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
    ignored: (p: string) => defaultIgnored(p.replace(/\\/g, "/")),
  });

  // Debounce state per path
  const pending = new Map<
    string,
    { action: "index" | "remove"; timer: NodeJS.Timeout | number }
  >();

  function schedule(rel: string, action: "index" | "remove") {
    const cur = pending.get(rel);
    const nextAction = cur
      ? cur.action === "remove" || action === "remove"
        ? "remove"
        : "index"
      : action;
    if (cur) {
      clearTimeout(cur.timer as any);
    }
    const timer = setTimeout(async () => {
      pending.delete(rel);
      if (nextAction === "remove") {
        await postJSON(`${bridgeUrl}/indexer/remove`, { path: rel }, TOKEN);
      } else {
        await postJSON(`${bridgeUrl}/indexer/index`, { path: rel }, TOKEN);
      }
    }, DEBOUNCE_MS);
    pending.set(rel, { action: nextAction, timer });
  }

  async function handle(event: "add" | "change" | "unlink", rawPath: string) {
    console.log({ event, rawPath });
    const rel = rawPath.replace(/\\/g, "/");
    if (defaultIgnored(rel)) return;
    if (await checkGitIgnored(repoRoot, rel)) return;
    schedule(rel, event === "unlink" ? "remove" : "index");
  }

  watcher.on("add", (p) => handle("add", p));
  watcher.on("change", (p) => handle("change", p));
  watcher.on("unlink", (p) => handle("unlink", p));

  return {
    close: async () => {
      await watcher.close();
      // Flush pending timers immediately
      for (const [rel, entry] of pending.entries()) {
        clearTimeout(entry.timer as any);
        // fire-and-forget flush based on action
        if (entry.action === "remove") {
          postJSON(`${bridgeUrl}/indexer/remove`, { path: rel }, TOKEN);
        } else {
          postJSON(`${bridgeUrl}/indexer/index`, { path: rel }, TOKEN);
        }
      }
      pending.clear();
    },
    // exposed for tests
    _handle: handle,
  } as const;
}
