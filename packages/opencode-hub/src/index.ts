import chokidar from "chokidar";
import path from "node:path";
import { createHash } from "node:crypto";
import { discoverRepos } from "./git.js";
import { loadConfig } from "./config.js";
import { OpencodeManager } from "./opencodeManager.js";
import { createHubServer } from "./hub.js";
import { NoopPersistence } from "./persistence/indexer.js";
import { indexGithubForRepo } from "./rag/githubIndexer.js";
import type { Repo } from "./types.js";

const cfg = loadConfig();
const mgr = new OpencodeManager(cfg);
const persistence = new NoopPersistence();

const repos = new Map<string, Repo>();

function hashPath(p: string) {
  return createHash("sha1").update(p).digest("hex").slice(0,12);
}

async function boot() {
  console.log("[hub] scanning", cfg.rootDir);
  const initial = await discoverRepos(cfg.rootDir);

  // Start opencode for each discovered repo
  for (const r of initial) {
    repos.set(r.id, r);
    await mgr.ensureRunning(r);
    // index GitHub issues/PRs in background
    // eslint-disable-next-line no-void
    void indexGithubForRepo(r, persistence).catch(err => console.warn("[github-index]", r.name, err.message));
  }

  // Watch for new repos appearing (creation of .git file/dir)
  const watcher = chokidar.watch(cfg.rootDir, {
    ignored: [/node_modules/, /\.git\/.+$/],
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
  });

  watcher.on("addDir", async (dir) => {
    const dotGit = path.join(dir, ".git");
    // quick check
    try {
      const st = await import("node:fs").then(m => m.promises.stat(dotGit)).catch(() => null);
      if (!st) return;
      const id = hashPath(dir);
      if (repos.has(id)) return;
      const name = path.basename(dir);
      const origin = await (await import("./git.js")).tryGetOrigin(dir);
      const { parseProvider } = await import("./git.js");
      const { provider, repoSlug } = parseProvider(origin);
      const r: Repo = { id, path: dir, name, origin, provider, repoSlug, status: "stopped" };
      repos.set(id, r);
      await mgr.ensureRunning(r);
      // eslint-disable-next-line no-void
      void indexGithubForRepo(r, persistence).catch(err => console.warn("[github-index]", r.name, err.message));
      console.log("[hub] new repo", name);
    } catch {}
  });

  const app = createHubServer(cfg, repos);
  await app.listen({ port: cfg.hubPort, host: "0.0.0.0" });
  console.log(`[hub] UI at http://localhost:${cfg.hubPort}/ui/index.html`);
}

boot().catch((err) => {
  console.error(err);
  process.exit(1);
});