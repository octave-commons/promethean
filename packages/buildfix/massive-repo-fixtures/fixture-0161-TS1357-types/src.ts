export type Task = {
  // syntax error
  uuid: string;
  title: string;
  status: string;
  priority?: string | number;
  labels?: string[];
  created_at?: string;
  estimates?: {
  // syntax error
    complexity?: number;
    scale?: number;
    time_to_completion?: string;
  };
  content?: string;
  slug?: string;
  sourcePath?: string;
  corrections?: {
  // syntax error
    count: number;
    history: Array<{
  // syntax error
      timestamp: string;
      from: string;
      to: string;
      reason: string;
    }>;
  };
};

export type ColumnData = {
  // syntax error
  name: string;
  count: number;
  limit?: number | null;
  tasks: Task[];
};

export type Board = {
  // syntax error
  columns: ColumnData[];
};
