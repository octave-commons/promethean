import { z } from "zod";
import type { ToolFactory } from "../../core/types.js";

export const githubRequestTool: ToolFactory = (ctx) => {
  const base = ctx.env.GITHUB_BASE_URL ?? "https://api.github.com";
  const apiVer = ctx.env.GITHUB_API_VERSION ?? "2022-11-28";
  const token = ctx.env.GITHUB_TOKEN;

  // Define SHAPE for the SDK and SCHEMA for runtime parsing
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

  const spec = {
    name: "github_request",
    description: "Call GitHub REST API with optional ETag cache & pagination.",
    inputSchema: shape, // <— ZodRawShape
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const url = new URL(args.path, base);
    const q = args.query ?? {};
    Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": apiVer,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(args.headers ?? {}),
    };

    const cacheKey = `rest:${url.toString()}`;

    const doFetch = async () => {
      const res = await ctx.fetch(url, {
        method: args.method,
        headers,
        body: args.body ? JSON.stringify(args.body) : undefined,
      } as RequestInit);

      if (res.status === 304 && ctx.cache) {
        const body = await ctx.cache.getBody(cacheKey);
        if (!body) return { status: 304, headers: {}, data: null };
        return {
          status: 200,
          headers: {},
          data: JSON.parse(new TextDecoder().decode(body)),
        };
      }

      const text = await res.text();
      const etag = res.headers.get("etag") ?? undefined;
      if (res.ok && ctx.cache && etag && args.method === "GET") {
        await ctx.cache.etagSet(cacheKey, etag);
        await ctx.cache.setBody(cacheKey, new TextEncoder().encode(text));
      }

      let data: unknown;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      return {
        status: res.status,
        headers: Object.fromEntries(res.headers),
        data,
      };
    };

    if (!args.paginate) return doFetch();

    const per = args.perPage ?? 100;
    const max = args.maxPages ?? 1;
    url.searchParams.set("per_page", String(per));

    const pages: unknown[] = [];
    for (let page = 1; page <= max; page++) {
      url.searchParams.set("page", String(page));
      const res = await ctx.fetch(url, {
        method: "GET",
        headers,
      } as RequestInit);
      const text = await res.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      if (!Array.isArray(data) || res.status >= 400)
        return { page, status: res.status, data };
      pages.push(...data);
      if ((data as unknown[]).length < per) break;
    }
    return pages;
  };

  return { spec, invoke };
};
