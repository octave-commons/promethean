export type ScarRecord = {
  start: string;
  end: string;
  tag: string;
  story: string;
  timestamp: Date;
  metadata?: Record<string, any>;
};

export type GitCommit = {
  sha: string;
  message: string;
  author: string;
  timestamp: Date;
  files: string[];
};
