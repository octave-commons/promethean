// Simple file system based repo discovery for development
import type { Repo } from "./types.js";
import { stableId } from "./util.js";

// BFS traversal to discover git work trees. Avoid following node_modules and .git internals.
export async function discoverRepos(rootDir: string): Promise<Repo[]> {
  const repos: Repo[] = [];
  const queue: string[] = [rootDir];
  const seen = new Set<string>();

  while (queue.length) {
    const cur = queue.shift()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    
    let entries: any[] = [];
    try {
      const fs = await import('node:fs');
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch { continue; }

    // If this directory itself is a git work tree (contains .git dir or .git file)
    const gitEntry = entries.find((e: any) => e.name === ".git");
    if (gitEntry) {
      const isDir = gitEntry.isDirectory();
      const isFile = gitEntry.isFile();
      if (isDir || isFile) {
        const id = stableId(cur);
        const path = await import('node:path');
        const name = path.basename(cur);
        const origin = await tryGetOrigin(cur);
        const { provider, repoSlug } = parseProvider(origin);
        repos.push({ id, path: cur, name, origin, provider, repoSlug, status: "stopped" });
        // For nested repos, continue to scan deeper — user requested 'many other gits with no particular structure'
      }
    }

    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name === ".git" || e.name === "node_modules" || e.name.startsWith(".")) {
        continue;
      }
      const path = await import('node:path');
      queue.push(path.join(cur, e.name));
    }
  }
  return repos;
}

function normalizeRemote(url: string): string {
  return url.replace(/^git@([^:]+):/,"https://$1/").replace(/\.git$/,"");
}

export async function tryGetOrigin(repoPath: string): Promise<string | null> {
  try {
    const { execSync } = await import('node:child_process');
    const stdout = execSync("git -C " + repoPath + " remote get-url origin", { encoding: 'utf8' });
    return stdout.trim();
  } catch { return null; }
}

// Extract GitHub slug `owner/name` from origin if applicable
export function parseProvider(origin?: string | null): { provider: "github" | "other" | null, repoSlug: string | null } {
  if (!origin) return { provider: null, repoSlug: null };
  const http = normalizeRemote(origin);
  try {
    const u = new URL(http);
    if (u.hostname.includes("github.com")) {
      const parts = u.pathname.replace(/^\//,"").split("/");
      if (parts.length >= 2) return { provider: "github", repoSlug: parts.slice(0,2).join("/") };
    }
    return { provider: "other", repoSlug: null };
  } catch {
    return { provider: null, repoSlug: null };
  }
}