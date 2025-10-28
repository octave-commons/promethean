export type ProcessConfig = {
  version: number;
  milestone: string;
  base_branch: string;
  statuses: ReadonlyArray<string>;
  label_map: Record<string, ReadonlyArray<string>>;
  pr_rules: Record<string, ReadonlyArray<string>>; // PR -> task file paths
  pr_checklists?: Record<string, string>; // PR -> checklist key
  checklists?: Record<string, ReadonlyArray<string>>;
  automation?: ReadonlyArray<{ task: string; description?: string }>;
};

export type TaskFM = {
  uuid: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'P1' | 'P2' | 'P3';
  labels?: ReadonlyArray<string>;
  created_at?: string;
};
