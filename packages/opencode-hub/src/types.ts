export interface Repo {
  id: string;              // hash of absolute path
  path: string;            // absolute path to repo root (work tree)
  name: string;            // directory name
  origin?: string | null;  // remote origin URL if present
  provider?: "github" | "other" | null;
  repoSlug?: string | null; // owner/name if GitHub
  port?: number;           // allocated opencode server port
  status: "stopped" | "starting" | "running" | "error";
  pid?: number;
}

export interface HubConfig {
  rootDir: string;
  hubPort: number;
  opencodeBin: string;
  opencodeArgs: string[];
  opencodeBasePort: number;
}

export interface SessionIndexEvent {
  repoId: string;
  event: string;
  payload: unknown;
  ts: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
  repoIds?: string[];
  tags?: string[];
}

export interface AgentPlan {
  id: string;
  title: string;
  targetRepos: string[];
  tasks: Array<{ id: string; title: string; repoId: string; }>;
}