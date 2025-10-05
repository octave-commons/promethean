import type { DiffPlan, GithubCommitOptions } from "./types.js";

export type Addition = {
  readonly path: string;
  readonly contents: string;
};

export type GraphqlPayload = {
  readonly query: string;
  readonly variables: Record<string, unknown>;
};

export type Deletion = { readonly path: string };

export type PlanSummary = {
  readonly plan: DiffPlan;
  readonly summary: string;
};

export type RequiredGithubOptions = GithubCommitOptions & {
  readonly repoRoot: string;
  readonly diff: string;
};
