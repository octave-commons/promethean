import * as path from "node:path";
import { promises as fs } from "node:fs";

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import rateLimit from "@fastify/rate-limit";
import type { RateLimitOptions } from "@fastify/rate-limit";
import { buildTree, filterTree, type TreeNode } from "@promethean/fs";

function errToString(e: unknown): string {
  return String((e as { message?: unknown })?.message ?? e);
}

type ListQuery = {
  readonly dir?: string;
  readonly maxDepth?: string;
  readonly maxEntries?: string;
  readonly exts?: string;
};

type Entry = {
  readonly type: "dir" | "file";
  readonly name: string;
  readonly children?: readonly Entry[];
  readonly size?: number;
};

const toEntryLimited = (
  n: TreeNode,
  remaining: number,
): readonly [Entry | null, number] => {
  if (n.type === "dir") {
    const [children, rem] = (n.children ?? []).reduce(
      (
        acc: readonly [readonly Entry[], number],
        child: TreeNode,
      ): readonly [readonly Entry[], number] => {
        const [current, r] = acc;
        if (r <= 0) return acc;
        const [c, next] = toEntryLimited(child, r);
        return [c ? [...current, c] : current, next] as const;
      },
      [[], remaining] as const,
    );
    return [{ type: "dir", name: n.name, children: [...children] }, rem];
  }
  if (n.type === "file") {
    if (remaining <= 0) return [null, remaining];
    return [
      {
        type: "file",
        name: n.name,
        ...(n.size !== undefined ? { size: n.size } : {}),
      },
      remaining - 1,
    ];
  }
  return [null, remaining];
};

async function listFilesHandler(
  req: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply,
) {
  const workspaceRoot = path.resolve(process.cwd());
  const root = path.resolve(workspaceRoot, req.query.dir || ".");
  const rel = path.relative(workspaceRoot, root);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return reply.code(400).send({ error: "invalid directory" });
  }
  const rawDepth = Number(req.query.maxDepth);
  const maxDepth = Number.isFinite(rawDepth)
    ? Math.max(0, Math.trunc(rawDepth))
    : 2;
  const rawEntries = Number(req.query.maxEntries);
  const maxEntries = Number.isFinite(rawEntries)
    ? Math.max(1, Math.trunc(rawEntries))
    : 500;
  const exts = new Set(
    (req.query.exts ?? ".md,.mdx,.txt,.markdown")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );

  const treeNode = await buildTree(root, { includeHidden: false, maxDepth });
  const filteredByExt = filterTree(treeNode, (n) => {
    if (n.type === "file") {
      const ext = (n.ext ?? "").toLowerCase();
      return exts.has(ext);
    }
    return true;
  });

  const tree = (filteredByExt?.children ?? [])
    .map((c) => toEntryLimited(c, maxEntries)[0])
    .filter((c): c is Entry => c !== null);
  reply.header("content-type", "application/json");
  return reply.send({ dir: root, tree });
}

async function readFileHandler(
  req: FastifyRequest<{ Querystring: { path?: string } }>,
  reply: FastifyReply,
) {
  const ROOT = path.resolve(process.cwd());
  const p = req.query.path ? path.resolve(ROOT, req.query.path) : "";
  const rel = p ? path.relative(ROOT, p) : "";
  if (!p || rel.startsWith("..") || path.isAbsolute(rel)) {
    return reply.code(400).send({ error: "invalid path" });
  }
  try {
    const content = await fs.readFile(p, "utf8");
    reply.header("content-type", "application/json");
    return reply.send({ path: p, content });
  } catch (e: unknown) {
    return reply.code(404).send({ error: errToString(e) });
  }
}

async function writeFileHandler(
  req: FastifyRequest<{ Body: { path?: string; content?: string } }>,
  reply: FastifyReply,
) {
  const ROOT = path.resolve(process.cwd());
  const p = req.body?.path ? path.resolve(ROOT, req.body.path) : "";
  const content = req.body?.content ?? "";
  const rel = p ? path.relative(ROOT, p) : "";
  if (!p || rel.startsWith("..") || path.isAbsolute(rel)) {
    return reply.code(400).send({ error: "invalid path" });
  }
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, content, "utf8");
    reply.header("content-type", "application/json");
    return reply.send({ ok: true });
  } catch (e: unknown) {
    return reply.code(500).send({ error: errToString(e) });
  }
}

export async function registerFileRoutes(app: FastifyInstance): Promise<void> {
  // Register rate limit plugin for local route settings (not global)
  await app.register(rateLimit, { global: false });

  const listFilesLimit = Object.freeze({
    max: 120,
    timeWindow: "1 minute",
  } satisfies RateLimitOptions);
  const readFileLimit = Object.freeze({
    max: 10,
    timeWindow: "1 minute",
  } satisfies RateLimitOptions);
  const writeFileLimit = Object.freeze({
    max: 10,
    timeWindow: "1 minute",
  } satisfies RateLimitOptions);

  // Basic file listing for File Explorer
  app.get<{
    Querystring: ListQuery;
  }>(
    "/api/files",
    {
      preHandler: app.rateLimit({ ...listFilesLimit }),
      config: { rateLimit: { ...listFilesLimit } },
    },
    listFilesHandler,
  );

  // Read a text file (UTF-8) under the workspace
  app.get<{ Querystring: { path?: string } }>(
    "/api/read-file",
    {
      preHandler: app.rateLimit({ ...readFileLimit }),
      config: { rateLimit: { ...readFileLimit } },
    },
    readFileHandler,
  );

  // Write a text file (UTF-8) under the workspace
  app.post<{ Body: { path?: string; content?: string } }>(
    "/api/write-file",
    {
      preHandler: app.rateLimit({ ...writeFileLimit }),
      config: { rateLimit: { ...writeFileLimit } },
    },
    writeFileHandler,
  );
}
