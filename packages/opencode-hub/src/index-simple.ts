// Simple file system watcher for development
import type { Repo, HubConfig } from "./types.js";
import { discoverRepos } from "./git.js";
import { createHub } from "./hub-simple.js";
import { SimpleAgent } from "./agent/router.js";
import { NoopPersistence } from "./persistence/indexer.js";

export async function startHub(config: HubConfig): Promise<void> {
  console.log("Starting OpenCode Hub...");
  console.log(`Root directory: ${config.rootDir}`);
  
  // Discover initial repositories
  const repos = await discoverRepos(config.rootDir);
  console.log(`Found ${repos.length} repositories`);

  // Start hub server
  await createHub(config, repos);

  // Simple file watching (without chokidar for now)
  console.log("Watching for repository changes...");
  
  // In a full implementation, you would:
  // 1. Use chokidar to watch for new git repos
  // 2. Spawn OpenCode servers for each repo
  // 3. Index sessions with persistence layer
  // 4. Handle agent requests via WebSocket
  
  console.log("OpenCode Hub started successfully!");
  console.log(`Available at: http://localhost:${config.hubPort}`);
  console.log(`UI at: http://localhost:${config.hubPort}/ui/index.html`);
}