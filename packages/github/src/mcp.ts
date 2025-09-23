/*
 * MCP Server: GitHub API over HTTP (with caching & pagination)
 * ------------------------------------------------------------
 * Exposes GitHub REST & GraphQL via Model Context Protocol tools.
 *
 * Features
 * - Streamable HTTP transport (default) and stdio transport for local use
 * - Auth via GITHUB_TOKEN (PAT or GitHub App user/installation token)
 * - Base URL override for GHES via GITHUB_BASE_URL, GraphQL via GITHUB_GRAPHQL_URL
 * - ETag-based response cache for GETs (file-backed) to save rate limit
 * - Automatic Link-header pagination when requested
 * - Sensible defaults for headers (Accept, X-GitHub-Api-Version, User-Agent)
 * - Idempotent and safe to re-run
 *
 * Usage (HTTP server):
 *   # env
 *   export GITHUB_TOKEN=ghp_...            # required for most endpoints
 *   export PORT=3000                        # optional (default 3000)
 *   export GITHUB_BASE_URL=https://api.github.com             # optional
 *   export GITHUB_GRAPHQL_URL=https://api.github.com/graphql  # optional
 *   export GITHUB_API_VERSION=2022-11-28                      # optional
 *   node dist/packages/mcp-github-http/src/index.js
 *
 * Usage (stdio server):
 *   export GITHUB_TOKEN=...
 *   node dist/packages/mcp-github-http/src/index.js stdio
 *
 * Tools
 *   - github_request(method, path, query?, headers?, body?, paginate?, maxPages?, perPage?, etagCache?)
 *   - github_graphql(query, variables?, operationName?)
 *   - github_rate_limit()
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

// ---------------------------
// Config & constants
// ---------------------------
const NAME = "mcp-github-http";
const VERSION = "0.1.1"; // bump after type fixes
const UA = `${NAME}/${VERSION}`;

const GITHUB_BASE_URL =
  process.env.GITHUB_BASE_URL?.trim() || "https://api.github.com";
const GITHUB_GRAPHQL_URL =
  process.env.GITHUB_GRAPHQL_URL?.trim() || "https://api.github.com/graphql";
const GITHUB_API_VERSION =
  process.env.GITHUB_API_VERSION?.trim() || "2022-11-28"; // current default per GH docs
const GITHUB_TOKEN = process.env.GITHUB_TOKEN?.trim();

// cache folder relative to CWD so it's easy to inspect & commit if desired
const CACHE_DIR = path.resolve(process.cwd(), ".cache", NAME);
const ETAG_DB = path.join(CACHE_DIR, "etags.json");
const BODY_DB = path.join(CACHE_DIR, "bodies");

// ensure cache dirs exist (idempotent)
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(BODY_DB, { recursive: true });

// ---------------------------
// Tiny ETag cache (file-backed)
// ---------------------------
interface ETagEntry {
  etag: string;
  bodyFile: string;
  updatedAt: string;
  status: number;
  headers: Record<string, string>;
}

async function readEtagDb(): Promise<Record<string, ETagEntry>> {
  try {
    const raw = await fsp.readFile(ETAG_DB, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
async function writeEtagDb(db: Record<string, ETagEntry>): Promise<void> {
  await fsp.writeFile(ETAG_DB, JSON.stringify(db, null, 2), "utf8");
}

function cacheKey(method: string, url: string, token?: string): string {
  // include token scope in key so private vs public caches don't leak
  const scope = token
    ? crypto.createHash("sha256").update(token).digest("hex").slice(0, 8)
    : "anon";
  return `${method.toUpperCase()} ${url}#${scope}`;
}

function bodyPathFor(key: string): string {
  const digest = crypto.createHash("sha256").update(key).digest("hex");
  return path.join(BODY_DB, `${digest}.json`);
}

// ---------------------------
// HTTP helpers
// ---------------------------
function buildUrl(
  base: string,
  route: string,
  query?: Record<string, unknown>,
): string {
  const clean = route.startsWith("/") ? route : `/${route}`;
  const u = new URL(base + clean);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) u.searchParams.append(`${k}[]`, String(item));
      } else {
        u.searchParams.set(k, String(v));
      }
    }
  }
  return u.toString();
}

function defaultHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "User-Agent": UA,
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  // merge after auth
  if (extra) {
    for (const [k, v] of Object.entries(extra)) if (v !== undefined) h[k] = v;
  }
  return h;
}

function parseLinkHeader(link: string | null): Record<string, string> {
  // Parses: <url>; rel="next", <url>; rel="last"
  const map: Record<string, string> = {};
  if (!link) return map;
  for (const part of link.split(",")) {
    const m = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    // Guard each capture since RegExpMatchArray types allow undefined for groups
    if (m && m[1] && m[2]) {
      const url = m[1] as string;
      const rel = m[2] as string;
      map[rel] = url;
    }
  }
  return map;
}

async function readJsonBody(file: string): Promise<unknown> {
  const raw = await fsp.readFile(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function writeJsonBody(file: string, value: unknown) {
  await fsp.writeFile(file, JSON.stringify(value), "utf8");
}

// ---------------------------
// GitHub fetch with ETag & pagination
// ---------------------------
export type GhFetchOptions = {
  paginate?: boolean;
  maxPages?: number;
  perPage?: number;
  etagCache?: boolean;
};

async function ghFetchJSON(
  method: string,
  route: string,
  query?: Record<string, unknown>,
  headers?: Record<string, string>,
  body?: unknown,
  options?: GhFetchOptions,
) {
  const {
    paginate = false,
    maxPages = 1,
    perPage,
    etagCache = true,
  } = options || {};
  const finalQuery = { ...(query || {}) } as Record<string, unknown>;
  if (
    method.toUpperCase() === "GET" &&
    paginate &&
    perPage &&
    finalQuery["per_page"] === undefined
  ) {
    finalQuery["per_page"] = perPage;
  }

  const url = buildUrl(GITHUB_BASE_URL, route, finalQuery);
  const key = cacheKey(method, url, GITHUB_TOKEN);

  const reqHeaders = defaultHeaders(headers);

  // ETag conditional GET
  const etagDb = await readEtagDb();
  const known = etagDb[key];
  if (etagCache && method.toUpperCase() === "GET" && known?.etag) {
    reqHeaders["If-None-Match"] = known.etag;
  }

  const init: RequestInit = { method, headers: reqHeaders } as any;
  if (body !== undefined && method.toUpperCase() !== "GET") {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    (init.headers as any)["Content-Type"] =
      (init.headers as any)["Content-Type"] || "application/json";
  }

  const firstRes = await fetch(url, init as any);
  const meta = pickRateLimit(firstRes.headers);

  // Handle 304 using cache
  if (firstRes.status === 304 && known) {
    const cached = await readJsonBody(known.bodyFile);
    return {
      json: cached,
      status: known.status,
      meta,
      headers: known.headers,
      fromCache: true,
    };
  }

  // Parse body (might be empty)
  const firstText = await firstRes.text();
  const firstJson = firstText ? safeJson(firstText) : null;

  // Persist ETag + body for GET 200s
  const resEtag = firstRes.headers.get("etag");
  if (etagCache && method.toUpperCase() === "GET" && firstRes.ok && resEtag) {
    const file = bodyPathFor(key);
    await writeJsonBody(file, firstJson);
    const headersObj = Object.fromEntries(firstRes.headers.entries());
    (etagDb as any)[key] = {
      etag: resEtag,
      bodyFile: file,
      updatedAt: new Date().toISOString(),
      status: firstRes.status,
      headers: headersObj,
    } as ETagEntry;
    await writeEtagDb(etagDb);
  }

  // Early return if not paginating or non-array
  if (!paginate || !Array.isArray(firstJson)) {
    return {
      json: firstJson,
      status: firstRes.status,
      meta,
      headers: Object.fromEntries(firstRes.headers.entries()),
      fromCache: false,
    };
  }

  // Auto-pagination for array responses
  const aggregated: unknown[] = [...firstJson];
  let pageCount = 1;
  let nextUrl = parseLinkHeader(firstRes.headers.get("link"))?.["next"];

  while (nextUrl && pageCount < (maxPages ?? 1)) {
    const pageRes = await fetch(nextUrl, {
      method: "GET",
      headers: defaultHeaders(),
    } as any);
    const pageText = await pageRes.text();
    const pageJson = pageText ? safeJson(pageText) : null;
    if (Array.isArray(pageJson)) aggregated.push(...pageJson);
    pageCount++;
    nextUrl = parseLinkHeader(pageRes.headers.get("link"))?.["next"];
  }

  return {
    json: aggregated,
    status: firstRes.status,
    meta,
    headers: Object.fromEntries(firstRes.headers.entries()),
    fromCache: false,
  };
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function pickRateLimit(h: Headers): Record<string, string | number | null> {
  return {
    limit: numOrNull(h.get("x-ratelimit-limit")),
    remaining: numOrNull(h.get("x-ratelimit-remaining")),
    used: numOrNull(h.get("x-ratelimit-used")),
    reset: numOrNull(h.get("x-ratelimit-reset")),
    resource: h.get("x-ratelimit-resource"),
  } as any;
}
function numOrNull(v: string | null): number | null {
  return v ? Number(v) : null;
}

// ---------------------------
// Build MCP server & tools
// ---------------------------
function buildServer() {
  const server = new McpServer({ name: NAME, version: VERSION });

  // Tool: generic REST request
  server.registerTool(
    "github_request",
    {
      title: "GitHub REST request",
      description:
        "Call any GitHub REST API endpoint (supports ETag cache & pagination)",
      inputSchema: {
        method: z
          .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
          .describe("HTTP method"),
        path: z
          .string()
          .describe("Endpoint path, e.g. /repos/{owner}/{repo}/issues"),
        query: z.record(z.any()).optional().describe("Query parameters object"),
        headers: z
          .record(z.string())
          .optional()
          .describe("Extra headers to include"),
        body: z.any().optional().describe("JSON body for non-GET methods"),
        paginate: z
          .boolean()
          .optional()
          .describe("Follow Link header for more pages (arrays only)"),
        maxPages: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Max pages to fetch when paginate=true"),
        perPage: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("per_page param to request page size"),
        etagCache: z
          .boolean()
          .optional()
          .describe("Enable ETag-based cache for GET (default true)"),
      },
    },
    async ({
      method,
      path,
      query,
      headers,
      body,
      paginate,
      maxPages,
      perPage,
      etagCache,
    }) => {
      if (!GITHUB_TOKEN) {
        return {
          content: [
            {
              type: "text",
              text: "Error: GITHUB_TOKEN is not set in the environment.",
            },
          ],
          isError: true,
        };
      }
      // With exactOptionalPropertyTypes, avoid passing undefined-valued properties.
      const opts: GhFetchOptions = {};
      if (paginate !== undefined) opts.paginate = paginate;
      if (maxPages !== undefined) opts.maxPages = maxPages;
      if (perPage !== undefined) opts.perPage = perPage;
      if (etagCache !== undefined) opts.etagCache = etagCache;

      const res = await ghFetchJSON(method, path, query, headers, body, opts);
      const payload = JSON.stringify(
        {
          url: buildUrl(GITHUB_BASE_URL, path, query),
          status: res.status,
          meta: res.meta,
          fromCache: res.fromCache,
          headers: res.headers,
          data: res.json,
        },
        null,
        2,
      );
      return { content: [{ type: "text", text: payload }] };
    },
  );

  // Tool: GraphQL
  server.registerTool(
    "github_graphql",
    {
      title: "GitHub GraphQL query",
      description:
        "POST to GitHub GraphQL API with optional variables and operationName",
      inputSchema: {
        query: z.string().describe("GraphQL query string"),
        variables: z.record(z.any()).optional().describe("GraphQL variables"),
        operationName: z.string().optional().describe("Operation name"),
      },
    },
    async ({ query, variables, operationName }) => {
      if (!GITHUB_TOKEN) {
        return {
          content: [
            {
              type: "text",
              text: "Error: GITHUB_TOKEN is not set in the environment.",
            },
          ],
          isError: true,
        };
      }
      const init: RequestInit = {
        method: "POST",
        headers: defaultHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ query, variables, operationName }),
      } as any;
      const res = await fetch(GITHUB_GRAPHQL_URL, init);
      const text = await res.text();
      const json = text ? safeJson(text) : null;
      const payload = JSON.stringify(
        {
          url: GITHUB_GRAPHQL_URL,
          status: res.status,
          meta: pickRateLimit(res.headers),
          data: json,
        },
        null,
        2,
      );
      return { content: [{ type: "text", text: payload }] };
    },
  );

  // Tool: Rate limit snapshot
  server.registerTool(
    "github_rate_limit",
    {
      title: "GitHub rate limit",
      description: "Fetch current GitHub REST API rate limit usage",
      inputSchema: {},
    },
    async () => {
      const res = await ghFetchJSON("GET", "/rate_limit");
      const payload = JSON.stringify(
        { status: res.status, meta: res.meta, data: res.json },
        null,
        2,
      );
      return { content: [{ type: "text", text: payload }] };
    },
  );

  return server;
}

// ---------------------------
// Bootstrap transports
// ---------------------------
async function runStdio() {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log(`${NAME} (stdio) ready`);
}

async function runHttp() {
  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req: Request, res: Response) => {
    // Stateless per-request server + transport to avoid ID collisions under concurrency
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () =>
    console.log(`${NAME} (http) listening on :${port} /mcp`),
  );
}

// Entry
const mode = process.argv[2] === "stdio" ? "stdio" : "http";
if (mode === "stdio") {
  runStdio().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  runHttp().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
