import { z } from "zod";

import type { ToolFactory, ToolSpec } from "../../core/types.js";

import { isBase64String, normalizeGithubPayload } from "./base64.js";

type GithubIdentity = Readonly<{
  readonly owner: string;
  readonly repo: string;
  readonly path: string;
}>;

type GithubCommitIdentity = Readonly<{
  readonly name: string;
  readonly email: string;
}>;

type GithubContentsArgs = Readonly<{
  readonly owner: string;
  readonly repo: string;
  readonly path: string;
  readonly message: string;
  readonly content: string;
  readonly branch?: string;
  readonly sha?: string;
  readonly committer?: GithubCommitIdentity;
  readonly author?: GithubCommitIdentity;
  readonly encoding?: "utf-8" | "base64";
}>;

const GithubContentsInputShape = {
  owner: z.string(),
  repo: z.string(),
  path: z.string(),
  message: z.string(),
  content: z.string(),
  branch: z.string().optional(),
  sha: z.string().optional(),
  committer: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  author: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  encoding: z.enum(["utf-8", "base64"]).optional(),
} as const;

const GithubContentsSchema = z.object(GithubContentsInputShape);

const encodeOwnerRepoPath = ({ owner, repo, path }: GithubIdentity): string => {
  const ownerPart = encodeURIComponent(owner);
  const repoPart = encodeURIComponent(repo);
  const pathPart = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/repos/${ownerPart}/${repoPart}/contents/${pathPart}`;
};

const encodeContent = (
  content: string,
  encoding: "utf-8" | "base64",
): string => {
  if (encoding === "base64") {
    if (!isBase64String(content)) {
      throw new Error(
        "Invalid base64 content provided to github.contents.write",
      );
    }
    return content;
  }
  return Buffer.from(content, "utf8").toString("base64");
};

const createHeaders = (
  apiVersion: string,
  token: string | undefined,
): Readonly<Record<string, string>> => ({
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": apiVersion,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const createRequestBody = (
  args: GithubContentsArgs,
  encodedContent: string,
): Readonly<Record<string, unknown>> => ({
  message: args.message,
  content: encodedContent,
  encoding: "base64",
  ...(args.branch ? { branch: args.branch } : {}),
  ...(args.sha ? { sha: args.sha } : {}),
  ...(args.committer ? { committer: args.committer } : {}),
  ...(args.author ? { author: args.author } : {}),
});

const headersToRecord = (
  headers: Readonly<Headers>,
): Readonly<Record<string, string>> =>
  Array.from(headers.entries()).reduce<Readonly<Record<string, string>>>(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  );

export const githubContentsWrite: ToolFactory = (ctx) => {
  const base = ctx.env.GITHUB_BASE_URL ?? "https://api.github.com";
  const apiVersion = ctx.env.GITHUB_API_VERSION ?? "2022-11-28";
  const token = ctx.env.GITHUB_TOKEN;

  const spec = {
    name: "github.contents.write",
    description:
      "Create or update a file via the GitHub contents API with automatic base64 encoding.",
    inputSchema: GithubContentsInputShape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const args = GithubContentsSchema.parse(raw);
    const encoding = args.encoding ?? "utf-8";
    const encodedContent = encodeContent(args.content, encoding);
    const path = encodeOwnerRepoPath({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
    });
    const url = new URL(path, base);
    const headers = createHeaders(apiVersion, token);
    const body = createRequestBody(args, encodedContent);
    const response = await ctx.fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    } as RequestInit);
    const responseText = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const dataSource =
      responseText.length === 0
        ? null
        : contentType.includes("json")
          ? (JSON.parse(responseText) as unknown)
          : (responseText as unknown);
    const data = normalizeGithubPayload(dataSource);

    return {
      status: response.status,
      headers: headersToRecord(response.headers),
      data,
    };
  };

  return { spec, invoke };
};
