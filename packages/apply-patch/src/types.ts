export type FileStatus = "modified" | "added" | "deleted" | "renamed";

export type DiffHunk = {
  readonly header: string;
  readonly lines: readonly string[];
};

export type DiffFile = {
  readonly oldPath: string | null;
  readonly newPath: string | null;
  readonly headers: readonly string[];
  readonly hunks: readonly DiffHunk[];
  readonly status: FileStatus;
  readonly binary: boolean;
};

export type DiffPlan = {
  readonly files: readonly DiffFile[];
};

export type JsonEditAction = "rewrite" | "append" | "delete" | "chmod";

export type JsonEditChange = {
  readonly path: string;
  readonly action: JsonEditAction;
  readonly content?: string;
  readonly mode?: string;
};

export type JsonEditDocument = {
  readonly changes: readonly JsonEditChange[];
};

export type GithubCommitMessage = {
  readonly headline: string;
  readonly body?: string;
};

export type GithubCommitOptions = {
  readonly repoRoot: string;
  readonly diff: string;
  readonly repositoryNameWithOwner: string;
  readonly branchName: string;
  readonly expectedHeadOid: string;
  readonly message?: GithubCommitMessage;
  readonly checkOnly?: boolean;
  readonly graphqlUrl?: string;
  readonly token?: string;
};

export type GithubCommitOverrides = {
  readonly fetchImpl?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
  readonly random?: () => number;
};

export type GithubCommitSuccess = {
  readonly ok: true;
  readonly kind: "Committed" | "CheckOnly";
  readonly summary: string;
  readonly oid?: string;
  readonly message?: GithubCommitMessage;
  readonly plan?: DiffPlan;
};

export type GithubCommitConflict = {
  readonly ok: false;
  readonly kind: "Conflict";
  readonly expectedHeadOid: string;
  readonly actualHeadOid: string;
  readonly summary: string;
};

export type GithubCommitParseError = {
  readonly ok: false;
  readonly kind: "ParseError";
  readonly summary: string;
};

export type GithubCommitCheckFailed = {
  readonly ok: false;
  readonly kind: "CheckFailed";
  readonly summary: string;
  readonly plan: DiffPlan;
};

export type GithubCommitGraphQLFailure = {
  readonly ok: false;
  readonly kind: "GraphQLError" | "UnexpectedResponse";
  readonly summary: string;
};

export type GithubCommitResult =
  | GithubCommitSuccess
  | GithubCommitConflict
  | GithubCommitParseError
  | GithubCommitCheckFailed
  | GithubCommitGraphQLFailure;

export type RunApplyPatchOptions = {
  readonly argv?: readonly string[];
  readonly input?: string;
  readonly repoRoot?: string;
};
