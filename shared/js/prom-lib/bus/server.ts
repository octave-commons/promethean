import WebSocket, { WebSocketServer } from "ws";
import { MongoStorage } from "./storage/mongo";
import { PublishRequest, SubscribeRequest, Ack, EventRow } from "./types";
import { assignPartition } from "./util";

export class BrokerServer {
  private subs = new Map<string, Map<number, Map<string, Set<WebSocket>>>>();
  private inflight = new Map<string, { deadline: number; ws: WebSocket }>();
  private ACK_TIMEOUT_MS = 30_000;

  constructor(
    private store: MongoStorage,
    private wss: WebSocketServer,
  ) {
    wss.on("connection", (ws: WebSocket) => this.onConn(ws));
    setInterval(() => this.redeliverySweep(), 1000);
  }

  private subset(topic: string, p: number, group: string) {
    if (!this.subs.has(topic)) this.subs.set(topic, new Map());
    const parts = this.subs.get(topic)!;
    if (!parts.has(p)) parts.set(p, new Map());
    const groups = parts.get(p)!;
    if (!groups.has(group)) groups.set(group, new Set());
    return groups.get(group)!;
  }

  private onConn(ws: WebSocket) {
    ws.on("message", (buf: WebSocket.RawData) => this.onMessage(ws, buf));
  }

  private async onMessage(ws: WebSocket, buf: WebSocket.RawData) {
    const msg = JSON.parse(buf.toString());
    if (msg.type === "PUBLISH")
      return this.handlePublish(ws, msg as PublishRequest);
    if (msg.type === "SUBSCRIBE")
      return this.handleSubscribe(ws, msg as SubscribeRequest);
    if (msg.type === "ACK" || msg.type === "NACK")
      return this.handleAck(ws, msg as Ack);
    if (msg.type === "FLOW") {
      /* TODO: adjust window */ return;
    }
  }

  private async handlePublish(ws: WebSocket, req: PublishRequest) {
    const cfg = await this.store.getConfig(req.topic);
    const p = assignPartition(req.key, cfg.partitions);
    const offset = await this.store.nextOffset(req.topic, p);
    const row: EventRow = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      topic: req.topic,
      key: req.key,
      partition: p,
      headers: req.headers,
      payload: req.payload,
      offset,
    };
    await this.store.insertEvent(row);
    this.notify(req.topic, p);
    ws.send(
      JSON.stringify({
        type: "PUBLISHED",
        topic: req.topic,
        partition: p,
        offset,
      }),
    );
  }

  private async handleSubscribe(ws: WebSocket, req: SubscribeRequest) {
    const p = 0; // TODO: multi-partition fan-in per connection
    this.subset(req.topic, p, req.group).add(ws);
    await this.deliver(
      req.topic,
      p,
      req.group,
      ws,
      req.max_inflight ?? 32,
      req.from,
    );
  }

  private inflightKey(topic: string, p: number, g: string, off: number) {
    return `${topic}:${p}:${g}:${off}`;
  }

  private async deliver(
    topic: string,
    p: number,
    g: string,
    ws: WebSocket,
    window: number,
    from?: SubscribeRequest["from"],
  ) {
    const start =
      from?.kind === "offset"
        ? from.value ?? 0
        : (await this.store.committed(topic, p, g)) + 1;
    const rows = await this.store.readFrom(topic, p, start, window);
    for (const row of rows) {
      const frame = {
        type: "MESSAGE",
        topic,
        partition: p,
        group: g,
        offset: row.offset,
        envelope: row,
      };
      ws.send(JSON.stringify(frame));
      this.inflight.set(this.inflightKey(topic, p, g, row.offset), {
        deadline: Date.now() + this.ACK_TIMEOUT_MS,
        ws,
      });
    }
  }

  private async handleAck(_ws: WebSocket, ack: Ack) {
    if (ack.type === "ACK")
      await this.store.commit(ack.topic, ack.partition, ack.group, ack.offset);
    this.inflight.delete(
      this.inflightKey(ack.topic, ack.partition, ack.group, ack.offset),
    );
  }

  private async redeliverySweep() {
    const now = Date.now();
    for (const [k, lease] of this.inflight) {
      if (lease.deadline <= now) {
        const [topic, pStr, g, offStr] = k.split(":");
        const p = Number(pStr),
          off = Number(offStr);
        try {
          const [row] = await this.store.readFrom(topic, p, off, 1);
          if (row)
            lease.ws.send(
              JSON.stringify({
                type: "MESSAGE",
                topic,
                partition: p,
                group: g,
                offset: row.offset,
                envelope: row,
              }),
            );
          lease.deadline = now + this.ACK_TIMEOUT_MS;
        } catch {}
      }
    }
  }

  private async notify(topic: string, p: number) {
    const groups = this.subs.get(topic)?.get(p);
    if (!groups) return;
    for (const [g, set] of groups)
      for (const ws of set) this.deliver(topic, p, g, ws, 32);
  }
}
