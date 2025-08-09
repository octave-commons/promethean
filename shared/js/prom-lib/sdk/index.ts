export type PublishOpts = {
  headers?: Record<string, string>;
  key?: string;
  tags?: string[];
  caused_by?: string[];
  sid?: string;
  ts?: number;
};

export class PromClient {
  private ws?: any;
  private url: string;
  private token?: string;
  private openOnce?: Promise<void>;
  private handlers = new Map<
    string,
    (event: any, ctx: any) => Promise<void> | void
  >();

  constructor(url: string, token?: string) {
    this.url = url;
    this.token = token;
  }

  async connect() {
    if (this.openOnce) return this.openOnce;
    this.openOnce = new Promise<void>((resolve, reject) => {
      const WSImpl: any =
        typeof (globalThis as any).WebSocket !== "undefined"
          ? (globalThis as any).WebSocket
          : require("ws");
      const ws = (this.ws = new WSImpl(this.url));
      ws.onopen = () => {
        ws.send(JSON.stringify({ op: "AUTH", token: this.token }));
      };
      ws.onmessage = (ev: any) => {
        const msg = JSON.parse(ev.data?.toString?.() ?? ev.data);
        if (msg.op === "OK") return resolve();
        if (msg.op === "ERR")
          return reject(new Error(`${msg.code}: ${msg.msg}`));
        if (msg.op === "EVENT") {
          const key = `${msg.topic}::${msg.group}`;
          const h = this.handlers.get(key);
          if (!h) return;
          Promise.resolve(h(msg.event, msg.ctx))
            .then(
              () =>
                this.ws?.send(
                  JSON.stringify({
                    op: "ACK",
                    topic: msg.topic,
                    group: msg.group,
                    id: msg.event.id,
                  }),
                ),
            )
            .catch(
              (e) =>
                this.ws?.send(
                  JSON.stringify({
                    op: "NACK",
                    topic: msg.topic,
                    group: msg.group,
                    id: msg.event.id,
                    reason: String(e?.message ?? e),
                  }),
                ),
            );
        }
      };
      ws.onerror = (e: any) => reject(new Error("ws_error"));
    });
    return this.openOnce;
  }

  async publish<T>(topic: string, payload: T, opts?: PublishOpts) {
    await this.connect();
    this.ws!.send(JSON.stringify({ op: "PUBLISH", topic, payload, opts }));
  }

  async subscribe<T = any>(
    topic: string,
    group: string,
    handler: (
      e: { id: string; payload: T; ts: number; topic: string },
      ctx: any,
    ) => any,
    opts?: any,
  ) {
    await this.connect();
    this.handlers.set(`${topic}::${group}`, handler as any);
    this.ws!.send(JSON.stringify({ op: "SUBSCRIBE", topic, group, opts }));
  }

  async unsubscribe(topic: string, group: string) {
    await this.connect();
    this.handlers.delete(`${topic}::${group}`);
    this.ws!.send(JSON.stringify({ op: "UNSUBSCRIBE", topic, group }));
  }

  close() {
    this.ws?.close();
  }
}
