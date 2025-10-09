export enum Priority {
  P0 = "P0",
  P1 = "P1",
  P2 = "P2",
  P3 = "P3",
  P4 = "P4",
}

export type TaskFM = {
  uuid: string;
  title: string;
  status: string; // e.g., backlog|todo|doing|review|blocked|done
  priority: Priority;
  labels?: string[];
  created_at?: string;
  assignee?: string;
};

export type TaskDoc = {
  file: string; // repo-relative path
  fm: TaskFM;
  content: string; // body without FM
};

export type PromptChunk = {
  heading: string; // e.g., "todo"
  prompt: string; // markdown body under that heading
};

export type RepoDoc = {
  path: string; // repo-relative
  kind: "code" | "doc";
  size: number;
  excerpt: string; // first N lines
};

export type FileMetadata = {
  path: string;
  mtime: number; // modification time
  size: number;
  hash: string; // content hash for change detection
  indexed: boolean; // whether currently in index
};

export type IndexStats = {
  totalFiles: number;
  indexedFiles: number;
  changedFiles: number;
  deletedFiles: number;
  newIndexTime: number;
  lastFullIndex?: number;
};

export type Embeddings = Record<string, number[]>; // key -> vector

export type ContextHit = {
  path: string;
  score: number;
  kind: "code" | "doc" | "test-results";
  excerpt: string;
};

export type TaskContext = {
  taskFile: string;
  hits: ContextHit[];
  links: string[]; // explicit links found in task
};

export type EvalItem = {
  taskFile: string;
  taskUuid: string;
  inferred_status: string;
  confidence: number; // 0..1
  summary: string;
  suggested_actions: string[];
  blockers?: string[];
  suggested_labels?: string[];
  suggested_assignee?: string;
};
