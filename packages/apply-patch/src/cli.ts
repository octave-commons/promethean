import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { applyJsonEdits } from "./json-edits.js";
import { parseUnifiedDiff } from "./diff.js";
import { DEFAULT_GITHUB_GRAPHQL_URL, createGithubCommit } from "./github.js";
import { sanitizeForLog } from "./sanitize.js";
import type {
  GithubCommitMessage,
  JsonEditDocument,
  RunApplyPatchOptions,
} from "./types.js";

function readStdinSync(): string {
  try {
    return readFileSync(0, "utf8").trim();
  } catch {
    return "";
  }
}

function getRepoRoot(): string {
  const probe = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  });
  return probe.status === 0 ? probe.stdout.trim() : process.cwd();
}

function isUnifiedDiff(value: string): boolean {
  return /^(diff --git|Index: |\+\+\+ |--- )/m.test(value);
}

function applyUnifiedDiff(
  diff: string,
  repoRoot: string,
  checkOnly: boolean,
): void {
  const args = [
    "apply",
    ...(checkOnly ? ["--check"] : []),
    "--whitespace=nowarn",
  ];
  const result = spawnSync("git", args, {
    encoding: "utf8",
    cwd: repoRoot,
    input: diff,
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error("git apply failed");
  }
}

type GithubPayload = {
  readonly github: {
    readonly repositoryNameWithOwner: string;
    readonly branchName: string;
    readonly expectedHeadOid: string;
    readonly message?: GithubCommitMessage;
    readonly graphqlUrl?: string;
    readonly token?: string;
  };
  readonly diff: string;
};

function parseJson(value: string): unknown | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch {
    return null;
  }
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseGithubPayload(input: unknown): GithubPayload | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as Record<string, unknown>;
  const github = record.github;
  const diffCandidate = record.patch ?? record.diff;
  if (!github || typeof github !== "object" || !hasString(diffCandidate)) {
    return null;
  }
  const diff = diffCandidate;
  const payload = github as Record<string, unknown>;
  const repositoryNameWithOwner = payload.repositoryNameWithOwner;
  const branchName = payload.branchName;
  const expectedHeadOid = payload.expectedHeadOid;
  if (
    !hasString(repositoryNameWithOwner) ||
    !hasString(branchName) ||
    !hasString(expectedHeadOid)
  ) {
    return null;
  }
  const message = payload.message as GithubCommitMessage | undefined;
  const graphqlUrl = payload.graphqlUrl as string | undefined;
  const token = payload.token as string | undefined;
  return {
    github: {
      repositoryNameWithOwner,
      branchName,
      expectedHeadOid,
      message,
      graphqlUrl,
      token,
    },
    diff,
  };
}

function isJsonEditDocument(value: unknown): value is JsonEditDocument {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.changes)) {
    return false;
  }
  return record.changes.every((change) => {
    if (!change || typeof change !== "object") {
      return false;
    }
    const changeRecord = change as Record<string, unknown>;
    return (
      typeof changeRecord.path === "string" &&
      typeof changeRecord.action === "string"
    );
  });
}

function handlePlanMode(diff: string): number {
  if (!isUnifiedDiff(diff)) {
    throw new Error("Plan mode expects a unified diff input.");
  }
  const plan = parseUnifiedDiff(diff);
  console.log(JSON.stringify(plan, null, 2));
  return 0;
}

function handleUnifiedDiffInput(
  diff: string,
  repoRoot: string,
  checkOnly: boolean,
): number {
  applyUnifiedDiff(diff, repoRoot, checkOnly);
  console.log(
    checkOnly
      ? "[apply_patch] OK (diff validated)"
      : "[apply_patch] OK (diff applied)",
  );
  return 0;
}

async function handleGithubPayload(
  payload: GithubPayload,
  repoRoot: string,
  checkOnly: boolean,
): Promise<number> {
  const result = await createGithubCommit(
    {
      repoRoot,
      diff: payload.diff,
      repositoryNameWithOwner: payload.github.repositoryNameWithOwner,
      branchName: payload.github.branchName,
      expectedHeadOid: payload.github.expectedHeadOid,
      message: payload.github.message,
      checkOnly,
      graphqlUrl: payload.github.graphqlUrl || DEFAULT_GITHUB_GRAPHQL_URL,
      token: payload.github.token || process.env.GITHUB_TOKEN,
    },
    {},
  );
  console.log(JSON.stringify(result, null, 2));
  if (result.ok || result.kind === "Conflict") {
    return 0;
  }
  return 2;
}

function handleJsonEdits(
  document: JsonEditDocument,
  repoRoot: string,
  checkOnly: boolean,
  allowAdd: boolean,
): number {
  applyJsonEdits(document, repoRoot, checkOnly, allowAdd);
  console.log(
    checkOnly
      ? "[apply_patch] OK (json validated)"
      : "[apply_patch] OK (json applied)",
  );
  return 0;
}

export async function runApplyPatch(
  options: RunApplyPatchOptions = {},
): Promise<number> {
  const argv = options.argv ?? process.argv.slice(2);
  const checkOnly = argv.includes("--check");
  const allowAdd = !argv.includes("--no-allow-add");
  const planOnly = argv.includes("--plan");
  const rawInput = options.input ?? readStdinSync();
  if (!rawInput) {
    throw new Error(
      "No input provided on stdin (expecting unified diff or JSON).",
    );
  }
  const repoRoot = options.repoRoot ?? getRepoRoot();
  if (planOnly) {
    return handlePlanMode(rawInput);
  }
  if (isUnifiedDiff(rawInput)) {
    return handleUnifiedDiffInput(rawInput, repoRoot, checkOnly);
  }
  const parsed = parseJson(rawInput);
  if (!parsed) {
    throw new Error(
      "Unrecognized input. Provide a unified diff or JSON edits.",
    );
  }
  const githubPayload = parseGithubPayload(parsed);
  if (githubPayload) {
    return handleGithubPayload(githubPayload, repoRoot, checkOnly);
  }
  if (!isJsonEditDocument(parsed)) {
    throw new Error(
      "Unrecognized input. Provide a unified diff or JSON edits.",
    );
  }
  return handleJsonEdits(parsed, repoRoot, checkOnly, allowAdd);
}

const isMain = (() => {
  if (!process.argv[1]) {
    return false;
  }
  const entry = resolve(process.argv[1]);
  return entry === fileURLToPath(import.meta.url);
})();

if (isMain) {
  runApplyPatch().catch((error: unknown) => {
    console.error("[apply_patch] fatal", sanitizeForLog({ error }));
    process.exit(1);
  });
}
