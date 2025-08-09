import express, { Request, Response } from "express";
import type { Db } from "mongodb";
import { MongoEventStore, MongoCursorStore } from "../event/mongo";
import { EventRecord } from "../event/types";

export function startOpsDashboard(db: Db, { port = 8082 } = {}) {
  const app = express();
  const events = new MongoEventStore(db);
  const cursors = new MongoCursorStore(db);

  // GET /cursors?topic=foo.bar
  app.get("/cursors", async (req: Request, res: Response) => {
    const topic = String(req.query.topic || "");
    if (!topic) return res.status(400).json({ error: "topic required" });
    const list = (await db.collection("cursors").find({}).toArray()) as any[];
    const filtered = list
      .filter((x) => String(x._id).startsWith(`${topic}::`))
      .map((x) => ({
        group: String(x._id).split("::")[1],
        lastId: x.lastId,
        lastTs: x.lastTs,
      }));
    res.json({ topic, cursors: filtered });
  });

  // GET /lag?topic=foo.bar&group=ops
  app.get("/lag", async (req: Request, res: Response) => {
    const topic = String(req.query.topic || "");
    const group = String(req.query.group || "");
    if (!topic || !group)
      return res.status(400).json({ error: "topic and group required" });
    const cur = await cursors.get(topic, group);
    const tail = (await events.scan(topic, { ts: 0, limit: 1_000_000 })).at(
      -1,
    ) as EventRecord | undefined;
    const lag = tail && cur?.lastId ? tail.ts - (cur.lastTs ?? 0) : null;
    res.json({
      topic,
      group,
      lastCursor: cur ?? null,
      tail: tail?.id ?? null,
      lagMs: lag,
    });
  });

  // GET /latest-by-key?topic=process.state&key=host:name:pid
  app.get("/latest-by-key", async (req: Request, res: Response) => {
    const topic = String(req.query.topic || "");
    const key = String(req.query.key || "");
    if (!topic || !key)
      return res.status(400).json({ error: "topic and key required" });
    if (!events.latestByKey)
      return res.status(400).json({ error: "latestByKey not supported" });
    const recs = await events.latestByKey(topic, [key]);
    res.json(recs[key] ?? null);
  });

  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[ops] dashboard on :${port}`);
  });
}
