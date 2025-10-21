export type Issue = {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
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
  readonly llm: LlmAdapter;
  readonly template?: (signal: AbortSignal) => Promise<string>;
  readonly now?: () => Date;
};

export type LlmAdapter = {
  complete: (args: {
    readonly system?: string;
    readonly prompt: string;
    readonly maxTokens?: number;
    readonly temperature?: number;
    readonly signal?: AbortSignal;
  }) => Promise<string>;
};

export type GithubAdapter = {
  readonly listIssues: (
    repo: string,
    opts?: { state?: 'open' | 'closed' | 'all' },
  ) => Promise<Issue[]>;
};
