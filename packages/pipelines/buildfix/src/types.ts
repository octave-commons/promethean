export type RawTscDiagnostic = {
  file: string;
  line: number;
  col: number;
  code: string; // TS2345
  message: string;
};

export type BuildError = {
  file: string;
  line: number;
  col: number;
  code: string; // TS2345
  message: string;
  frame: string; // code frame
  key: string; // `${code}|${file}|${line}`
};

export type ErrorList = {
  createdAt: string;
  tsconfig: string;
  errors: BuildError[];
};

export type History = {
  key: string;
  file: string;
  code: string;
  attempts: Attempt[];
  resolvedAt?: string;
};

export type Attempt = {
  n: number;
  snippetPath: string;
  planSummary: string;
  tscBeforeCount: number;
  tscAfterCount: number;
  resolved: boolean;
  errorStillPresent: boolean;
  newErrors: string[];
  // git mode
  branch?: string;
  commitSha?: string;
  pushed?: boolean;
  prUrl?: string;
  // rollback
  regressed?: boolean; // after > before
  rolledBack?: boolean; // worktree restored after regression
};

export type Summary = {
  iteratedAt: string;
  tsconfig: string;
  maxCycles: number;
  items: Array<{
    key: string;
    resolved: boolean;
    attempts: number;
    lastSnippet?: string;
    branch?: string;
  }>;
};
