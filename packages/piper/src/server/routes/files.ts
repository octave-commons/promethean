import * as path from "node:path";
import { promises as fs } from "node:fs";

import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { buildTree, filterTree, type TreeNode } from "@promethean/fs";

export async function registerFileRoutes(app: FastifyInstance) {
  // Register rate limit plugin for local route settings (not global)
  await app.register(rateLimit, { global: false });
  // Basic file listing for File Explorer
  app.get<{
    Querystring: {
      dir?: string;
      maxDepth?: string;
      maxEntries?: string;
      exts?: string;
    };
  }>(
    "/api/files",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, reply) => {
      const workspaceRoot = path.resolve(process.cwd());
      const root = path.resolve(workspaceRoot, req.query.dir || ".");
    if (!root.startsWith(workspaceRoot)) {
      return reply.code(400).send({ error: "invalid directory" });
    }
    const maxDepth = Math.max(0, Number(req.query.maxDepth || "2") | 0) || 2;
    const maxEntries = Math.max(1, Number(req.query.maxEntries || "500") | 0) || 500;
    const exts = new Set(
      (req.query.exts || ".md,.mdx,.txt,.markdown")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
    type Node = { type: "dir" | "file"; name: string; children?: Node[]; size?: number };

    const treeNode = await buildTree(root, { includeHidden: false, maxDepth });
    let count = 0;
    const filtered = filterTree(treeNode, (n) => {
      if (n.type === "file") {
        const ext = (n.ext ?? "").toLowerCase();
        if (!exts.has(ext) || count >= maxEntries) return false;
        count++;
      }
      return true;
    });

    function toNode(n: TreeNode): Node | null {
      if (n.type === "dir") {
        const children = n.children?.map(toNode).filter((c): c is Node => c !== null);
        return { type: "dir", name: n.name, children: children ?? [] };
      }
      if (n.type === "file") {
        return { type: "file", name: n.name, ...(n.size !== undefined ? { size: n.size } : {}) };
      }
      return null;
    }

    const tree = filtered?.children?.map(toNode).filter((c): c is Node => c !== null) ?? [];
    reply.header("content-type", "application/json");
    return reply.send({ dir: root, tree });
  });

  // Read a text file (UTF-8) under the workspace
  app.get<{ Querystring: { path?: string } }>(
    "/api/read-file",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, reply) => {
      const ROOT = process.cwd();
      const p = req.query.path ? path.resolve(req.query.path) : "";
      if (!p || !p.startsWith(ROOT)) {
        return reply.code(400).send({ error: "invalid path" });
      }
      try {
        const content = await fs.readFile(p, "utf8");
        reply.header("content-type", "application/json");
        return reply.send({ path: p, content });
      } catch (e: unknown) {
        return reply.code(404).send({ error: String((e as any)?.message ?? e) });
      }
    },
  );

  // Write a text file (UTF-8) under the workspace
  app.post<{ Body: { path?: string; content?: string } }>(
    "/api/write-file",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, reply) => {
      const ROOT = process.cwd();
      const p = req.body?.path ? path.resolve(req.body.path) : "";
      const content = req.body?.content ?? "";
      if (!p || !p.startsWith(ROOT)) {
        return reply.code(400).send({ error: "invalid path" });
      }
      try {
        await fs.mkdir(path.dirname(p), { recursive: true });
        await fs.writeFile(p, content, "utf8");
        reply.header("content-type", "application/json");
        return reply.send({ ok: true });
      } catch (e: unknown) {
        return reply.code(500).send({ error: String((e as any)?.message ?? e) });
      }
    },
  );
}
