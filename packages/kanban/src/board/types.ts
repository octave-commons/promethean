export type Status = "open" | "doing" | "blocked" | "done" | "dropped";
export type Priority = "low" | "medium" | "high" | "critical";

export type TaskFM = Readonly<{
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  owner: string;
  labels: ReadonlyArray<string>;
  created: string;
  updated?: string;
  uuid?: string;
  created_at?: string;
  rel?: {
    readonly blocks?: ReadonlyArray<string>;
    readonly blockedBy?: ReadonlyArray<string>;
    readonly links?: ReadonlyArray<string>;
  };
  milestone?: string;
}>;

export type IndexedTask = TaskFM & Readonly<{ path: string; content?: string }>;
