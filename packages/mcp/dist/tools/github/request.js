import { z } from "zod";
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
};
const Schema = z.object(shape);
const parseTextPayload = async (text) => text.length === 0
    ? null
    : await Promise.resolve()
        .then(() => JSON.parse(text))
        .catch(() => text);
const toHeadersRecord = (headers) => Object.fromEntries(headers);
const storeCacheBody = async ({ ctx, key, etag, text, }) => {
    if (!ctx.cache) {
        return;
    }
    const encoded = new TextEncoder().encode(text);
    await Promise.all([
        ctx.cache.etagSet(key, etag),
        ctx.cache.setBody(key, encoded),
    ]);
};
const readCachedBody = async ({ ctx, key, }) => {
    if (!ctx.cache) {
        return undefined;
    }
    const body = await ctx.cache.getBody(key);
    if (!body) {
        return undefined;
    }
    const cached = JSON.parse(new TextDecoder().decode(body));
    return {
        status: 200,
        headers: {},
        data: normalizeGithubPayload(cached),
    };
};
const buildHeaders = (token, apiVersion, overrides) => ({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": apiVersion,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(overrides ?? {}),
});
const fetchSingle = async (options) => {
    const { ctx, args, url, headers, cacheKey } = options;
    const response = await ctx.fetch(url, {
        method: args.method,
        headers,
        body: args.body ? JSON.stringify(args.body) : undefined,
    });
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
const fetchPageSequence = async (options) => {
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
    });
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
export const githubRequestTool = (ctx) => {
    const base = ctx.env.GITHUB_BASE_URL ?? "https://api.github.com";
    const apiVer = ctx.env.GITHUB_API_VERSION ?? "2022-11-28";
    const token = ctx.env.GITHUB_TOKEN;
    const spec = {
        name: "github_request",
        description: "Call GitHub REST API with optional ETag cache & pagination.",
        inputSchema: Schema.shape, // <— ZodRawShape
        outputSchema: undefined,
        examples: [
            {
                args: { method: "GET", path: "/repos/riatzukiza/promethean" },
                comment: "Fetch repo metadata",
            },
            {
                args: {
                    method: "GET",
                    path: "/repos/riatzukiza/promethean/issues",
                    paginate: true,
                    perPage: 100,
                    maxPages: 3,
                },
                comment: "Stream issues with pagination",
            },
        ],
        stability: "experimental",
        since: "0.1.0",
    };
    const invoke = async (raw) => {
        const args = Schema.parse(raw);
        const baseUrl = new URL(args.path, base);
        const entries = Object.entries(args.query ?? {});
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
//# sourceMappingURL=request.js.map