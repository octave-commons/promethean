import { z } from "zod";
import type { ReadonlyDeep } from "type-fest";

import type { ToolContext, ToolFactory } from "../../core/types.js";

import { normalizeGithubPayload } from "./base64.js";

const shape = {
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z.string(),
  query: z.record(z.any()).optional(),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  paginate: z.boolean().optional(),
  perPage: z.number().int().positive().max(1000).optional(),
  maxPages: z.number().int().positive().max(100).optional(),
} as const;

const Schema = z.object(shape);

type GithubRequestArgs = ReadonlyDeep<z.infer<typeof Schema>>;

type GithubResponse = Readonly<{
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly data: unknown;
}>;

const parseTextPayload = async (text: string): Promise<unknown> =>
  text.length === 0
    ? null
    : await Promise.resolve()
        .then(() => JSON.parse(text) as unknown)
        .catch(() => text);

const toHeadersRecord = (headers: Headers): Readonly<Record<string, string>> =>
  Object.fromEntries(headers);

const storeCacheBody = async ({
  ctx,
  key,
  etag,
  text,
}: Readonly<{
  readonly ctx: ToolContext;
  readonly key: string;
  readonly etag: string;
  readonly text: string;
}>): Promise<void> => {
  if (!ctx.cache) {
    return;
  }
  const encoded = new TextEncoder().encode(text);
  await Promise.all([
    ctx.cache.etagSet(key, etag),
    ctx.cache.setBody(key, encoded),
  ]);
};

const readCachedBody = async ({
  ctx,
  key,
}: Readonly<{ readonly ctx: ToolContext; readonly key: string }>): Promise<
  GithubResponse | undefined
> => {
  if (!ctx.cache) {
    return undefined;
  }
  const body = await ctx.cache.getBody(key);
  if (!body) {
    return undefined;
  }
  const cached = JSON.parse(new TextDecoder().decode(body)) as unknown;
  return {
    status: 200,
    headers: {},
    data: normalizeGithubPayload(cached),
  };
};

const buildHeaders = (
  token: string | undefined,
  apiVersion: string,
  overrides: Readonly<Record<string, string>> | undefined,
): Readonly<Record<string, string>> => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": apiVersion,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(overrides ?? {}),
});

type FetchSingleOptions = ReadonlyDeep<{
  readonly ctx: ToolContext;
  readonly args: GithubRequestArgs;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly cacheKey: string;
}>;

const fetchSingle = async (
  options: FetchSingleOptions,
): Promise<GithubResponse> => {
  const { ctx, args, url, headers, cacheKey } = options;
  const response = await ctx.fetch(url, {
    method: args.method,
    headers,
    body: args.body ? JSON.stringify(args.body) : undefined,
  } as RequestInit);

  if (response.status === 304) {
    const cached = await readCachedBody({ ctx, key: cacheKey });
    return cached ?? { status: 304, headers: {}, data: null };
  }

  const text = await response.text();
  if (response.ok && ctx.cache && args.method === "GET") {
    const etag = response.headers.get("etag");
    if (etag) {
      await storeCacheBody({ ctx, key: cacheKey, etag, text });
    }
  }

  const data = await parseTextPayload(text);
  return {
    status: response.status,
    headers: toHeadersRecord(response.headers),
    data: normalizeGithubPayload(data),
  };
};

type FetchPageOptions = ReadonlyDeep<{
  readonly ctx: ToolContext;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly per: number;
  readonly max: number;
  readonly page: number;
  readonly acc: ReadonlyArray<unknown>;
}>;

const fetchPageSequence = async (
  options: FetchPageOptions,
): Promise<unknown> => {
  const { ctx, url, headers, per, max, page, acc } = options;
  if (page > max) {
    return acc;
  }
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("per_page", String(per));
  pageUrl.searchParams.set("page", String(page));
  const response = await ctx.fetch(pageUrl, {
    method: "GET",
    headers,
  } as RequestInit);
  const text = await response.text();
  const parsed = await parseTextPayload(text);
  const normalized = normalizeGithubPayload(parsed);
  if (!Array.isArray(normalized) || response.status >= 400) {
    return { page, status: response.status, data: normalized };
  }
  const nextAcc = acc.concat(normalized);
  if (normalized.length < per) {
    return nextAcc;
  }
  return fetchPageSequence({
    ctx,
    url,
    headers,
    per,
    max,
    page: page + 1,
    acc: nextAcc,
  });
};

export const githubRequestTool: ToolFactory = (ctx) => {
  const base = ctx.env.GITHUB_BASE_URL ?? "https://api.github.com";
  const apiVer = ctx.env.GITHUB_API_VERSION ?? "2022-11-28";
  const token = ctx.env.GITHUB_TOKEN;

  const spec = {
    name: "github_request",
    description: "Call GitHub REST API with optional ETag cache & pagination.",
    inputSchema: shape, // <— ZodRawShape
    outputSchema: { status: 200, headers: {}, data: {} } as any,
    examples: [
      {
        args: { method: "GET", path: "/repos/riatzukiza/promethean" },
        comment: "Fetch repo metadata",
      },
      {
        args: { method: "GET", path: "/repos/riatzukiza/promethean/issues", paginate: true, perPage: 100, maxPages: 3 },
        comment: "Stream issues with pagination",
      },
    ],
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const baseUrl = new URL(args.path, base);
    const entries = Object.entries(args.query ?? {}) as ReadonlyArray<
      readonly [string, unknown]
    >;
    entries.forEach(([key, value]) => {
      baseUrl.searchParams.set(key, String(value));
    });
    const url = baseUrl.toString();
    const headers = buildHeaders(token, apiVer, args.headers);
    const cacheKey = `rest:${url}`;

    if (args.paginate) {
      const per = args.perPage ?? 100;
      const max = args.maxPages ?? 1;
      return fetchPageSequence({
        ctx,
        url,
        headers,
        per,
        max,
        page: 1,
        acc: [],
      });
    }

    return fetchSingle({ ctx, args, url, headers, cacheKey });
  };

  return { spec, invoke };
};
