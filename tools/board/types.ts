export type Status = 'open' | 'doing' | 'blocked' | 'done' | 'dropped';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TaskFM = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  owner: string;
  labels: string[];
  created: string;
  updated?: string;
  rel?: { blocks?: string[]; blockedBy?: string[]; links?: string[] };
  milestone?: string;
};

export type IndexedTask = TaskFM & { path: string };
