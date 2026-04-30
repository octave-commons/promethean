import type { FastifyPluginAsync } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { sha256Bytes } from "../../lib/hash.js";
import { paths, blobPath } from "../../lib/paths.js";

export const blobRoutes: FastifyPluginAsync = async (app) => {
  app.post("/blobs", async (req, reply) => {
    const cfg = (app as any).openplannerConfig;
    const p = paths(cfg?.dataDir ?? process.env.OPENPLANNER_DATA_DIR ?? "./openplanner-lake");
    await fs.mkdir(p.blobsDir, { recursive: true });

    const mp = await (req as any).file();
    if (!mp) return reply.status(400).send({ error: "expected multipart field 'file'" });

    const buf: Buffer = await mp.toBuffer();
    const sha = sha256Bytes(buf);

    const outPath = blobPath(p.blobsDir, sha);
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    try {
      await fs.access(outPath);
    } catch {
      await fs.writeFile(outPath, buf);
    }

    return { ok: true, sha256: sha, mime: mp.mimetype, name: mp.filename, size: buf.length };
  });

  app.get("/blobs/:sha256", async (req, reply) => {
    const { sha256 } = req.params as any;
    if (!/^[a-f0-9]{64}$/.test(sha256)) return reply.status(400).send({ error: "invalid sha256" });

    const cfg = (app as any).openplannerConfig;
    const p = paths(cfg?.dataDir ?? process.env.OPENPLANNER_DATA_DIR ?? "./openplanner-lake");
    const filePath = blobPath(p.blobsDir, sha256);

    try {
      const buf = await fs.readFile(filePath);
      reply.header("Content-Type", "application/octet-stream");
      return reply.send(buf);
    } catch {
      return reply.status(404).send({ error: "blob not found" });
    }
  });
};
