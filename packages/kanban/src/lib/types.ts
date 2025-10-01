export type Task = {
  uuid: string;
  title: string;
  status: string;
  priority?: string | number;
  labels?: string[];
  created_at?: string;
  estimates?: {
    complexity?: number;
    scale?: number;
    time_to_completion?: string;
  };
  content?: string;
  slug?: string;
  sourcePath?: string;
};

export type ColumnData = {
  name: string;
  count: number;
  limit?: number | null;
  tasks: Task[];
};

export type Board = {
  columns: ColumnData[];
};
