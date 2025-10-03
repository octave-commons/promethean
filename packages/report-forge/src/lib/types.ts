export type Issue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  labels: readonly { name: string }[];
  url: string;
  createdAt: string;
  closedAt?: string;
  body?: string;
};

export type ReportInput = {
  /** GitHub repository slug in `owner/name` format. */
  repo: string;
  /** Issues to summarize, usually sourced from the GitHub REST API. */
  issues: readonly Issue[];
};

export type ReportOptions = {
  llm: LlmAdapter;
  template?: (signal: AbortSignal) => Promise<string>;
  now?: () => Date;
};

export type LlmAdapter = {
  complete: (args: {
    system?: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }) => Promise<string>;
};

export type GithubAdapter = {
  listIssues: (
    repo: string,
    opts?: { state?: "open" | "closed" | "all" },
  ) => Promise<Issue[]>;
};
